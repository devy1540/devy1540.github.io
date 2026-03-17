---
title: "ECS에서 EKS로 - kustomize + Gateway API 기반 운영 환경 구축기"
date: "2026-03-12"
description: "AWS ECS에서 EKS로 마이그레이션하면서 kustomize base/overlay 패턴, K8s Gateway API, Karpenter 노드 오토스케일링, Blue/Green 배포 전략까지 구축한 경험을 공유합니다."
tags: ["kubernetes", "eks", "kustomize", "gateway-api", "karpenter", "devops", "aws"]
series: "서비스 인프라 현대화"
seriesOrder: 1
draft: false
---

## 배경

기존에는 AWS ECS 위에서 서비스를 운영하고 있었다. GitHub Actions에서 Docker 이미지를 빌드하고, `aws ecs update-service --force-new-deployment`로 배포하는 단순한 구조였다.

```mermaid
flowchart LR
    A[GitHub Actions] --> B[Docker Build]
    B --> C[ECR Push]
    C --> D[ECS Update Service]
    D --> E[Task Definition 교체]
```

이 구조가 동작은 했지만, 서비스가 커지면서 불편한 점이 쌓여갔다.

### ECS에서 느꼈던 한계

- **환경별 설정 관리가 귀찮았다** - dev, stage, prod마다 별도의 Task Definition을 관리해야 했고, 환경 변수 하나 바꾸려면 AWS 콘솔을 들여다보거나 별도 스크립트를 돌려야 했다
- **인프라 상태를 코드로 추적하기 어려웠다** - Task Definition 리비전이 쌓이긴 하지만, "현재 어떤 설정으로 돌아가고 있는지"를 Git에서 확인할 수 없었다
- **로그 확인이 비싸고 불편했다** - CloudWatch Logs 자체 비용도 만만치 않았다. 서비스 수가 늘면서 로그 그룹도 늘어나고, 특히 dev나 stage 같은 개발 환경에서까지 CloudWatch 비용을 내면서 로그를 보는 건 비효율적이었다. Datadog을 붙이면 편해지지만 비용이 더 올라가고, CloudWatch만으로는 여러 서비스의 로그를 크로스로 추적하거나 트레이스와 연동하기가 한계가 있었다
- **Blue/Green 배포가 복잡했다** - 가장 큰 고통이었다. 아래에서 자세히 설명한다

### ECS Blue/Green - 왜 복잡했나

ECS에서 Blue/Green 배포를 하려면 ECS 서비스를 두 개(Blue, Green) 띄우고, ALB Target Group을 각각 연결한 뒤, 배포할 때마다 ALB 라우팅 룰을 조작해야 했다. 이걸 GitHub Actions 워크플로우에서 셸 스크립트로 관리하고 있었다.

실제 `deploy-blue.yml`의 핵심 로직이다:

```yaml
# deploy-blue.yml - ECS Blue/Green 배포
- name: Set service for main branch
  env:
    DOMAIN: ${{ vars.DOMAIN }}
    LISTENER_ARN: ${{ secrets.LISTENER_ARN }}
  run: |
    # 1. ALB Listener Rule을 조회해서 현재 어느 Target Group이 활성인지 판단
    RULE_ARN=$(aws elbv2 describe-rules \
      --listener-arn $LISTENER_ARN \
      --query "Rules[?Conditions[?Field=='host-header' && Values && Values[0] == '$DOMAIN']].Actions[].TargetGroupArn" \
      --output text)

    # 2. Target Group 이름으로 Blue/Green 판단 → 반대쪽에 배포
    if [[ "$RULE_ARN" == *Blue* ]]; then
      echo "ALB is routing to Blue Target Group"
      echo "deploy_tag=prod" >> $GITHUB_OUTPUT
    elif [[ "$RULE_ARN" == *Green* ]]; then
      echo "ALB is routing to Green Target Group"
      echo "deploy_tag=prod-temp" >> $GITHUB_OUTPUT
    else
      echo "No matching routing rule found!"
      exit 1
    fi
```

이 방식의 문제점:

1. **배포 워크플로우가 두 개** - `deploy-blue.yml`과 `deploy-green.yml`을 따로 관리해야 했다. 빌드 로직이 바뀌면 두 파일을 동시에 수정해야 했다
2. **ALB 상태 조회에 의존** - 배포 시점에 ELB API를 호출해서 현재 라우팅 상태를 판단한다. API 응답이 느리거나 실패하면 배포가 막힌다
3. **트래픽 전환이 별도 작업** - 이미지를 배포하는 것과 트래픽을 전환하는 것이 분리되어 있어서, 배포 후 ALB 라우팅 룰을 수동으로 바꿔야 했다
4. **상태 추적 불가** - "지금 Blue가 활성이야, Green이 활성이야?"를 ALB API를 호출하지 않으면 알 수 없었다. Git에는 이 상태가 기록되지 않는다

### 왜 EKS인가

EKS를 선택한 건 결국 **선언적 인프라 관리**가 핵심이었다.

| | ECS | EKS |
|---|---|---|
| **설정 관리** | Task Definition (AWS 콘솔/CLI) | YAML 매니페스트 (Git) |
| **환경 분리** | 서비스별 Task Definition | Kustomize overlay |
| **배포 전략** | ALB 라우팅 룰 직접 조작 | HTTPRoute weight 한 줄 변경 |
| **로그/모니터링** | CloudWatch or Datadog (비용 부담) | OTel 사이드카 + LGTM 스택 (오픈소스) |
| **사이드카** | Task Definition에 컨테이너 추가 | Pod spec에 컨테이너 추가 |
| **상태 추적** | AWS 콘솔 | Git + ArgoCD |

인프라 설정 전체를 Git으로 관리하고, ArgoCD로 클러스터와 동기화하면 "현재 운영 상태 = Git 저장소 상태"가 된다. 이게 GitOps의 핵심이고, EKS 마이그레이션의 가장 큰 동기였다.

## 전체 아키텍처

마이그레이션 후 구성된 전체 아키텍처다.

```mermaid
flowchart TB
    subgraph CLUSTER["EKS Cluster (my-cluster)"]
        subgraph NETWORKING["networking namespace"]
            GW["common-gateway<br/>(ALB, HTTPS, WAF)"]
        end

        subgraph DEV["dev namespace"]
            D1["my-backend-dev"]
            D2["my-web-dev"]
        end

        subgraph STAGE["stage namespace"]
            S1["my-backend-stage"]
            S2["my-web-stage"]
        end

        subgraph PROD["prod namespace"]
            P1["my-backend-prod<br/>(3 replicas)"]
            P2["my-web-blue<br/>(6 replicas, HPA)"]
            P3["my-web-green<br/>(6 replicas, HPA)"]
        end

        subgraph SYSTEM["시스템 컴포넌트"]
            KARPENTER["Karpenter<br/>(노드 오토스케일링)"]
            ARGOCD["ArgoCD<br/>(GitOps)"]
            OTEL["OTel Collector<br/>(사이드카)"]
        end
    end

    GW -->|"dev-api.example.com"| D1
    GW -->|"stage-api.example.com"| S1
    GW -->|"api.example.com"| P1
    GW -->|"app.example.io<br/>(weight 기반)"| P2 & P3

    ARGOCD -->|"Git 동기화"| DEV & STAGE & PROD
    KARPENTER -->|"노드 프로비저닝"| DEV & STAGE & PROD
```

핵심 구성 요소:

- **my-cluster 저장소** - 모든 K8s 매니페스트를 관리하는 GitOps 저장소
- **Kustomize** - base/overlay 패턴으로 환경별 설정 분리
- **K8s Gateway API** - ALB Controller 기반 트래픽 라우팅
- **Karpenter** - 워크로드 기반 노드 오토스케일링
- **ArgoCD** - Git ↔ 클러스터 상태 동기화

## 클러스터 구성

### eksctl로 EKS 클러스터 생성

클러스터는 `eksctl`로 생성했다. 선언적 YAML 설정 파일 하나로 VPC, 노드그룹, 애드온까지 한 번에 구성할 수 있어서 편하다.

```yaml
# cluster-config.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: my-cluster
  region: ap-northeast-2
  version: "1.34"

vpc:
  id: vpc-0ba95360
  clusterEndpoints:
    privateAccess: true
    publicAccess: true
  subnets:
    private:
      ap-northeast-2a: { id: subnet-xxx }
      ap-northeast-2b: { id: subnet-xxx }
      ap-northeast-2c: { id: subnet-xxx }
      ap-northeast-2d: { id: subnet-xxx }

iam:
  withOIDC: true  # IRSA 활성화

addons:
  - name: vpc-cni
  - name: coredns
  - name: kube-proxy
  - name: metrics-server

managedNodeGroups:
  - name: system
    instanceType: t3.medium
    desiredCapacity: 2
    minSize: 2
    maxSize: 3
    privateNetworking: true
    labels:
      role: system
      node-type: system
```

4개 AZ에 private/public 서브넷을 배치하고, OIDC Provider를 활성화해서 IRSA(IAM Roles for Service Accounts)를 쓸 수 있게 했다. 시스템 노드그룹은 CoreDNS, Karpenter 같은 클러스터 컴포넌트용이고, 실제 워크로드는 Karpenter가 관리하는 노드에서 돌아간다.

### IRSA - Pod별 최소 권한

ECS에서는 Task Role로 권한을 관리했는데, EKS에서는 IRSA로 ServiceAccount에 IAM Role을 바인딩한다. Pod가 AWS API를 호출할 때 해당 ServiceAccount에 연결된 IAM Role의 권한만 사용하게 된다.

```yaml
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-sa
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/PodoBackendRole
```

서비스마다 전용 ServiceAccount를 만들어서, my-backend는 S3/SQS/Secrets Manager 접근 권한만, my-web은 필요한 최소 권한만 갖도록 분리했다. ECS Task Role과 개념은 같지만, K8s 네이티브하게 관리할 수 있어서 더 깔끔하다.

## Kustomize - 환경별 설정 관리

마이그레이션의 가장 큰 고민 중 하나가 "환경별 설정을 어떻게 관리할 것인가"였다.

### 왜 Kustomize인가

Helm도 고려했지만 Kustomize를 선택했다. 이유는 단순하다 - **우리 서비스에 범용 차트가 필요 없었다**. Helm은 범용 패키지 배포에 강점이 있지만, 자체 서비스는 환경별 "차이점"만 관리하면 되기 때문에 Kustomize의 base/overlay 패턴이 더 직관적이었다.

### 디렉토리 구조

```
my-cluster/
├── my-backend/
│   ├── base/                    # 공통 리소스
│   │   ├── kustomization.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── route.yaml           # HTTPRoute
│   │   ├── serviceaccount.yaml
│   │   └── otel-collector-config.yaml
│   └── overlays/
│       ├── dev/                 # dev 환경 패치
│       ├── stage/               # stage 환경 패치
│       ├── prod/                # prod 환경 패치
│       └── qa/                  # QA 환경 패치
├── my-web/
│   ├── base/
│   └── overlays/
│       ├── blue/                # Blue 배포 슬롯
│       ├── green/               # Green 배포 슬롯
│       ├── routes/              # 트래픽 가중치 라우팅
│       ├── dev/
│       └── stage/
├── my-notification/
│   ├── base/
│   └── overlays/
└── global/
    ├── networking/              # Gateway API 리소스
    └── karpenter/               # 노드 오토스케일링
```

### Base - 공통 리소스 정의

base에는 모든 환경에서 공유하는 리소스 템플릿을 둔다.

```yaml
# my-backend/base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-backend
  template:
    spec:
      containers:
        - name: my-backend
          image: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/api.example.com:latest
          ports:
            - name: http
              containerPort: 9285
            - name: grpc
              containerPort: 50051
          env:
            - name: OTEL_TRACES_EXPORTER
              value: otlp
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: http://localhost:4317
          readinessProbe:
            httpGet:
              path: /status/health/readiness
              port: 9285
            initialDelaySeconds: 40
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /status/health/liveness
              port: 9285
            initialDelaySeconds: 60
            periodSeconds: 15
        # OTel Collector 사이드카
        - name: otel-collector
          image: otel/opentelemetry-collector-contrib:0.139.0
          resources:
            requests:
              cpu: 200m
              memory: 256Mi
```

base에서 주목할 점은 **OTel Collector 사이드카**가 기본으로 포함된다는 것이다. 모든 환경에서 로그·트레이스·메트릭을 수집하되, 전송 대상(Loki, Tempo 등)은 overlay에서 환경별로 설정한다.

### Overlay - 환경별 차이만 패치

overlay에서는 환경별로 달라지는 부분만 정의한다. kustomization.yaml에서 base를 참조하고, 패치 파일로 차이점을 덮어쓴다.

```yaml
# my-backend/overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

nameSuffix: -prod
namespace: prod

resources:
  - ../../base
  - targetgroupconfig.yaml
  - rbac.yaml
  - podbudget.yaml

patches:
  - deployment.patch.yaml
  - service.patch.yaml
  - route.patch.yaml
  - serviceaccount.patch.yaml
  - otel-collector-config.patch.yaml

images:
  - name: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/api.example.com
    newTag: prod-260227-1650    # ← CI에서 자동 업데이트
```

`nameSuffix: -prod`가 모든 리소스 이름에 `-prod`를 붙여준다. `my-backend` → `my-backend-prod`가 되어서 같은 클러스터 안에서 환경이 겹치지 않는다.

prod의 deployment 패치는 이렇다:

```yaml
# my-backend/overlays/prod/deployment.patch.yaml
spec:
  replicas: 3
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9285"
        prometheus.io/path: "/status/prometheus"
    spec:
      serviceAccountName: my-sa-prod
      terminationGracePeriodSeconds: 60
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: nodepool
                    operator: In
                    values: [prod-backend-nodepool]
      tolerations:
        - key: dedicated
          operator: Equal
          value: prod-backend
          effect: NoSchedule
      containers:
        - name: my-backend
          env:
            - name: PROFILE
              value: prod
            - name: OTEL_SERVICE_NAME
              value: my-backend-prod
          resources:
            requests:
              cpu: 100m
              memory: 2048Mi
            limits:
              cpu: 1500m
              memory: 4096Mi
```

prod에서만 replicas를 3으로 올리고, 전용 nodepool에 스케줄링하고, 리소스 제한을 걸고, Prometheus 스크래핑을 활성화한다. dev overlay는 replicas 1에 리소스도 작게 잡는다.

### 환경별 비교

| | dev | stage | prod |
|---|---|---|---|
| **Replicas** | 1 | 1~2 | 3 (백엔드), 6 (웹, HPA 6~24) |
| **CPU/Memory** | 200m / 128Mi | 500m / 512Mi | 1500m / 4Gi |
| **Nodepool** | dev-nodepool | stage-nodepool | prod-backend-nodepool |
| **이미지 태그** | `dev` (mutable) | `stage` (mutable) | `prod-YYMMDD-HHMM` (immutable) |
| **PDB** | 없음 | 없음 | minAvailable: 1 |
| **HPA** | 없음 | 없음 | CPU 30% 기준 |

적용은 한 줄이면 된다:

```bash
# dev 환경 배포
kubectl apply -k my-backend/overlays/dev

# prod 환경 배포
kubectl apply -k my-backend/overlays/prod
```

같은 base를 공유하면서도 환경별로 완전히 다른 설정이 적용된다. ECS에서 Task Definition을 환경별로 복사-수정하던 것과 비교하면 훨씬 깔끔해졌다.

## K8s Gateway API

### 왜 Ingress가 아닌 Gateway API인가

EKS에서 외부 트래픽을 받는 방법은 여러 가지다. NGINX Ingress Controller를 쓸 수도 있고, AWS ALB Ingress Controller를 쓸 수도 있다. 실제로 다른 클러스터에서는 NGINX Ingress의 VirtualServer CRD를 사용하고 있었다.

이번에는 **K8s Gateway API**를 선택했다. 이유:

- **K8s 공식 표준** - Ingress API는 v1 이후 새로운 기능 추가 없이 사실상 유지보수 모드에 들어갔다. Gateway API가 공식 후속 사양으로, K8s 커뮤니티에서 적극적으로 개발하고 있다. 새로 구축하는데 Ingress를 선택할 이유가 없었다
- **역할 분리가 명확하다** - GatewayClass(인프라) → Gateway(클러스터 운영) → HTTPRoute(서비스 개발) 세 계층으로 나뉘어서, 인프라 팀과 서비스 팀이 각자 관리할 영역이 명확하다
- **weight 기반 트래픽 분할이 네이티브** - Blue/Green 배포에 필수인 트래픽 가중치가 HTTPRoute 스펙에 내장되어 있다

```mermaid
flowchart TB
    subgraph INFRA["인프라 레벨"]
        GC["GatewayClass<br/>(alb - AWS ALB Controller)"]
        LBC["LoadBalancerConfiguration<br/>(WAF, 인증서, 서브넷)"]
    end

    subgraph CLUSTER["클러스터 레벨"]
        GW["Gateway<br/>(common-gateway)<br/>HTTPS:443, TLS 종료"]
    end

    subgraph SERVICE["서비스 레벨 (환경별)"]
        R1["HTTPRoute<br/>my-backend-route<br/>api.example.com"]
        R2["HTTPRoute<br/>my-web-route<br/>app.example.io<br/>(weight 기반)"]
        R3["HTTPRoute<br/>grafana-route<br/>monitoring.example.io"]
    end

    GC --> GW
    LBC --> GC
    GW --> R1 & R2 & R3
```

### AWS Load Balancer Controller + Gateway API

Gateway API는 스펙일 뿐이고, 실제로 ALB를 생성하고 관리하는 건 **AWS Load Balancer Controller**다. v2.16부터 Gateway API를 네이티브로 지원한다. GatewayClass, Gateway, HTTPRoute 리소스를 감시하다가, 변경이 생기면 ALB를 자동으로 생성/수정한다.

설치는 Helm으로 한다:

```bash
helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set enableWaf=true \
  --set enableWafv2=true
```

컨트롤러가 ALB를 관리하려면 EC2, ELBv2, ACM, WAF 등 광범위한 AWS 권한이 필요하다. IRSA로 전용 ServiceAccount에 IAM Role을 바인딩해서 최소 권한을 부여한다.

핵심은 **Gateway API 매니페스트만 관리하면 ALB가 알아서 따라온다**는 것이다. ECS에서는 Terraform으로 ALB를 따로 만들고, Target Group을 등록하고, Listener Rule을 설정하고, WAF를 연결하는 게 전부 별도 작업이었다. 이제는 YAML 파일 몇 개로 끝난다.

### GatewayClass - ALB 타입 선언

GatewayClass는 "어떤 종류의 로드밸런서를 쓸 것인가"를 선언한다. `controllerName: gateway.k8s.aws/alb`가 AWS Load Balancer Controller에게 "이 GatewayClass의 Gateway는 내가 관리한다"고 알려준다.

```yaml
# gatewayclass-alb.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: alb
spec:
  controllerName: gateway.k8s.aws/alb
  parametersRef:
    group: gateway.k8s.aws
    kind: LoadBalancerConfiguration
    name: alb-default
    namespace: kube-system
```

LoadBalancerConfiguration에서 ALB의 세부 설정을 정의한다. 여기서 WAF, 인증서, 서브넷 같은 AWS 특화 설정을 넣는다.

```yaml
# gatewayclass-alb-config.yaml
apiVersion: gateway.k8s.aws/v1beta1
kind: LoadBalancerConfiguration
metadata:
  name: alb-default
  namespace: kube-system
spec:
  scheme: internet-facing
  listenerConfigs:
    - protocolPort: "HTTPS:443"
      listenerAttributes:
        - key: routing.http2.enabled
          value: "true"
  certificates:
    - arn:aws:acm:ap-northeast-2:123456789012:certificate/xxx  # example.io
    - arn:aws:acm:ap-northeast-2:123456789012:certificate/xxx  # example.com
  wafv2Arn: arn:aws:wafv2:ap-northeast-2:123456789012:regional/webacl/common-web-acl/xxx
```

WAF ARN을 여기에 넣으면 ALB에 WAF가 자동으로 연결된다. ECS에서는 ALB를 먼저 만들고 WAF를 수동으로 연결해야 했는데, 이제 매니페스트 한 줄로 관리된다.

### Gateway - 공유 HTTPS 엔드포인트

Gateway는 실제 ALB 인스턴스에 대응한다. 모든 서비스가 하나의 Gateway를 공유하도록 설계했다.

```yaml
# common-gateway.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: common-gateway
  namespace: networking
spec:
  gatewayClassName: alb
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      allowedRoutes:
        namespaces:
          from: All   # 모든 namespace의 HTTPRoute 허용
      tls:
        mode: Terminate
```

`allowedRoutes.namespaces.from: All`이 핵심이다. dev, stage, prod 어느 namespace에서든 이 Gateway를 참조할 수 있어서, ALB 하나로 모든 환경의 트래픽을 받는다. 비용 절감에도 도움이 된다.

### HTTPRoute - 서비스별 라우팅

각 서비스는 HTTPRoute로 도메인 기반 라우팅을 정의한다.

```yaml
# my-backend/base/route.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-backend-route
spec:
  parentRefs:
    - name: common-gateway
      namespace: networking
      sectionName: https
  hostnames: []          # ← overlay에서 환경별로 패치
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: my-backend
          port: 9285
```

base에서 hostnames를 비워두고, overlay에서 환경별 도메인을 넣는다:

```yaml
# overlays/dev/route.patch.yaml
spec:
  hostnames:
    - dev-api.example.com
    - dev-api.example.io

# overlays/prod/route.patch.yaml
spec:
  hostnames:
    - api.example.com
    - api-green.example.com
    - my-api.example.io
```

이렇게 하면 같은 ALB에서 호스트 헤더 기반으로 요청이 각 환경의 서비스로 라우팅된다.

### TargetGroupConfiguration - 헬스체크

ALB Target Group의 헬스체크 설정도 K8s 매니페스트로 관리한다.

```yaml
# overlays/prod/targetgroupconfig.yaml
apiVersion: gateway.k8s.aws/v1beta1
kind: TargetGroupConfiguration
metadata:
  name: my-backend-prod
spec:
  targetReference:
    kind: Service
    name: my-backend-prod
  defaultConfiguration:
    targetType: ip
    healthCheckConfig:
      healthCheckPath: /status/health/liveness
      healthCheckPort: "9285"
      healthCheckProtocol: HTTP
      healthCheckInterval: 30
      healthyThresholdCount: 2
      unhealthyThresholdCount: 5
```

ECS에서 ALB Target Group을 AWS 콘솔에서 설정하던 게, 이제 YAML 한 파일로 들어온다.

## Karpenter - 노드 오토스케일링

### Cluster Autoscaler vs Karpenter

ECS에서 EC2 ASG 기반 Capacity Provider를 쓰고 있었는데, 스케일 아웃이 느렸다. 새 인스턴스가 뜨고 ECS Agent가 연결되기까지 2~3분은 기본이었다.

Karpenter를 선택한 이유는 명확하다:

- **30초 내 노드 프로비저닝** - Pod가 Pending 상태가 되면 즉시 적합한 인스턴스를 띄운다
- **워크로드 기반 인스턴스 선택** - Pod의 리소스 요청을 보고 최적의 인스턴스 타입을 자동으로 골라준다
- **빈 노드 자동 정리** - 워크로드가 없는 노드를 30초 후 자동으로 내려서 비용을 절감한다

### NodePool 설계

워크로드 특성에 따라 NodePool을 분리했다.

```mermaid
flowchart TB
    subgraph NP["NodePool 구성"]
        DEV["dev-nodepool<br/>CPU: 20, Mem: 160Gi<br/>ARM64"]
        STAGE["stage-nodepool<br/>CPU: 100, Mem: 400Gi<br/>ARM64"]
        PROD_BE["prod-backend-nodepool<br/>CPU: 1000, Mem: 2000Gi<br/>ARM64"]
        PROD_WEB["prod-my-web-nodepool<br/>CPU: 1000, Mem: 2000Gi<br/>ARM64"]
    end

    DEV --> D["dev 워크로드"]
    STAGE --> S["stage 워크로드"]
    PROD_BE --> P1["my-backend-prod"]
    PROD_WEB --> P2["my-web-blue/green"]
```

base NodePool 정의:

```yaml
# global/karpenter/base/nodepool.yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: nodepool
spec:
  template:
    nodeClassRef:
      name: nodeclass-base
    requirements:
      - key: kubernetes.io/arch
        values: ["arm64"]           # ARM 인스턴스 (20% 저렴)
    taints:
      - key: dedicated
        value: base
        effect: NoSchedule          # Taint로 격리
    expireAfter: 720h               # 30일 후 자동 교체
  limits:
    cpu: "1000"
    memory: "2000Gi"
  disruption:
    consolidationPolicy: WhenEmptyOrUnderutilized
    consolidateAfter: 30s           # 30초 후 빈 노드 정리
```

ARM64 인스턴스를 기본으로 쓴다. x86 대비 약 20% 저렴하고, Java/Node.js 워크로드에서 성능 차이가 거의 없다. Docker 이미지만 멀티 아키텍처로 빌드하면 된다. 실제로 my-backend의 CI에서 `--platform linux/amd64,linux/arm64`로 빌드하고 있다.

Taint/Toleration으로 NodePool 간 격리를 보장한다. `dedicated=prod-backend:NoSchedule` taint가 걸린 노드에는 해당 toleration이 있는 Pod만 스케줄링된다.

`consolidateAfter: 30s`로 빈 노드를 빠르게 정리한다. dev 환경에서 퇴근 후 트래픽이 없으면 노드가 자동으로 내려가서 야간 비용이 크게 줄었다.

## Blue/Green 배포 전략

프론트엔드(my-web)는 Blue/Green 배포를 적용했다. Gateway API의 weight 기반 트래픽 분할을 활용한다.

### 구조

```
my-web/overlays/
├── blue/          # Blue 슬롯 (6 replicas, HPA 6~24)
├── green/         # Green 슬롯 (6 replicas, HPA 6~24)
└── routes/        # 트래픽 가중치 관리
```

Blue와 Green은 완전히 독립된 Deployment다. 각각 별도의 Service, ServiceAccount, HPA를 가진다.

```yaml
# my-web/overlays/blue/kustomization.yaml
nameSuffix: -blue
namespace: prod
images:
  - name: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/app.example.io
    newTag: web-prod-260227-1649
```

### 트래픽 전환

HTTPRoute의 `weight`로 트래픽을 제어한다.

```yaml
# my-web/overlays/routes/route.patch.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-web-route
spec:
  hostnames:
    - app.example.io
    - app.example.com
  rules:
    - backendRefs:
        - name: my-web-green
          port: 3000
          weight: 100       # Green으로 전체 트래픽
        - name: my-web-blue
          port: 3000
          weight: 0         # Blue는 대기
```

배포 과정:

```mermaid
sequenceDiagram
    participant DEV as 개발자
    participant BLUE as Blue (대기)
    participant GREEN as Green (활성)
    participant ROUTE as HTTPRoute

    Note over GREEN: weight: 100 (현재 트래픽 수신 중)
    Note over BLUE: weight: 0

    DEV->>BLUE: 1. 새 이미지 배포
    Note over BLUE: 새 버전 롤아웃
    DEV->>BLUE: 2. 헬스체크 확인
    DEV->>ROUTE: 3. weight 전환 (100/0)
    Note over BLUE: weight: 100 (활성)
    Note over GREEN: weight: 0 (대기)
    Note over GREEN: 이전 버전 유지 (즉시 롤백 가능)
```

롤백은 weight를 다시 바꾸면 된다. 이전 버전이 그대로 살아있으니 새로 배포할 필요 없이 **트래픽만 전환**하면 즉시 복구된다.

ECS에서 ALB 라우팅 룰을 AWS API로 직접 조작하던 것과 비교하면, YAML 파일 한 줄 수정으로 트래픽을 전환할 수 있게 됐다. Git 커밋 히스토리에도 남아서 "언제, 누가, 왜 전환했는지" 추적이 가능하다.

### HPA - 트래픽 기반 자동 확장

```yaml
# my-web/overlays/blue/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 6
  maxReplicas: 24
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 30
```

기본 6개 Pod로 운영하되, CPU 사용률이 30%를 넘으면 최대 24개까지 자동 확장한다. Karpenter가 노드를 즉시 프로비저닝해주니, HPA가 Pod를 늘리면 노드도 자동으로 따라온다.

## CI/CD 파이프라인 연동

ECS 시절의 배포 문제점은 앞서 배경에서 다뤘다. EKS로 전환하면서 배포 파이프라인을 **환경별로 완전히 다른 전략**으로 분리했다.

```mermaid
flowchart TB
    A["GitHub Push / Dispatch"] --> B["GitHub Actions"]

    subgraph CI["CI - GitHub Actions"]
        B --> C["Gradle Build + OTel Agent 다운로드"]
        C --> D["Docker Build<br/>(multi-arch: amd64+arm64)"]
        D --> E["ECR Push"]
    end

    subgraph CD_DEV["dev/stage - Image Updater 자동 배포"]
        E -->|"mutable tag<br/>(dev, stage)"| F["ArgoCD Image Updater<br/>1분마다 ECR 폴링<br/>digest 변경 감지"]
        F --> G["ArgoCD 자동 Sync"]
        G --> H["Slack 알림<br/>#dev_notify"]
    end

    subgraph CD_PROD["prod - Git 커밋 + Slack 승인"]
        E -->|"immutable tag<br/>(prod-YYMMDD-HHMM)"| I["my-cluster 저장소<br/>kustomize edit set image"]
        I --> J["GitHub Release 생성<br/>(커밋 목록, diff URL)"]
        J --> K["n8n webhook<br/>배포 승인 요청"]
        K --> L["Slack 승인 버튼"]
        L --> M["Lambda → ArgoCD Sync<br/>(n8n-bot)"]
        M --> N["Slack 결과 알림"]
    end
```

### dev/stage - Image Updater 자동 배포

dev, stage 브랜치에 push하면 GitHub Actions가 이미지를 빌드하고 ECR에 mutable 태그(`dev`, `stage`)로 push한다. 여기까지가 CI의 역할이고, CD는 ArgoCD Image Updater가 처리한다.

Image Updater는 ECR을 1분마다 폴링하면서 이미지 digest 변경을 감지한다. 같은 `dev` 태그라도 실제 이미지가 바뀌면 ArgoCD가 자동으로 sync한다.

```yaml
# ArgoCD ApplicationSet (dev 환경)
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: my-apps-dev
spec:
  generators:
    - list:
        elements:
          - app: my-backend
            image: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/api.example.com
            tag: dev
          - app: my-web
            image: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/app.example.io
            tag: dev
          # ... 7개 서비스
  template:
    metadata:
      name: '{{app}}-dev'
      annotations:
        argocd-image-updater.argoproj.io/image-list: 'app={{image}}:{{tag}}'
        argocd-image-updater.argoproj.io/app.update-strategy: digest
        argocd-image-updater.argoproj.io/write-back-method: argocd
    spec:
      source:
        repoURL: https://github.com/my-org/my-cluster.git
        path: '{{app}}/overlays/dev'
      destination:
        namespace: dev
      syncPolicy:
        automated:
          prune: false
          selfHeal: false
```

ApplicationSet의 list generator로 서비스 목록을 정의하고, template에서 Image Updater 어노테이션을 붙인다. 서비스가 추가되면 elements에 한 항목만 추가하면 된다.

Image Updater의 핵심 설정:

```yaml
# argocd-image-updater-values.yaml
config:
  registries:
    - name: AWS ECR
      prefix: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
      credentials: ext:/scripts/ecr-login.sh    # IRSA로 ECR 인증
  interval: 1m                                   # 1분마다 폴링

serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/argocd-ecr-access-role
```

ECR 인증에 IRSA를 사용한다. Image Updater의 ServiceAccount에 IAM Role을 바인딩해서, 별도 credential 관리 없이 ECR에 접근한다.

### prod - Git 커밋 + Slack 승인 배포

prod 배포는 `workflow_dispatch`로 시작한다. 배포 내용(Jira 티켓 등)을 입력받고, 여러 단계를 거친다.

**1단계: immutable 태그 생성 + ECR Push**

```yaml
# deploy.yml
- name: Generate immutable tag
  run: |
    IMMUTABLE_TAG="prod-$(TZ=Asia/Seoul date +%y%m%d-%H%M)"
    # 예: prod-260317-1430

- name: Build, tag, and push image to Amazon ECR
  run: |
    docker buildx build --platform linux/amd64,linux/arm64 \
      -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMMUTABLE_TAG \
      -t $ECR_REGISTRY/$ECR_REPOSITORY:prod \
      --push .
```

prod는 mutable 태그가 아닌 `prod-YYMMDD-HHMM` 형식의 immutable 태그를 사용한다. 어떤 시점에 어떤 이미지가 배포됐는지 추적이 가능하고, 롤백 시 이전 태그를 그대로 쓸 수 있다.

**2단계: my-cluster 매니페스트 업데이트**

```yaml
- name: Update my-cluster manifest
  run: |
    git clone https://x-access-token:${CLUSTER_PAT}@github.com/my-org/my-cluster.git
    cd my-cluster/my-backend/overlays/prod

    # 롤백용 이전 태그 캡처
    PREV_TAG=$(grep 'newTag:' kustomization.yaml | awk '{print $2}')

    # kustomize로 이미지 태그 변경
    kustomize edit set image ${ECR_REPO}:${NEW_TAG}

    git commit -m "chore: update my-backend prod image to ${NEW_TAG}"
    git push
```

여기서 핵심은 **이전 태그를 캡처**하는 것이다. 문제가 생기면 이 태그로 즉시 롤백할 수 있다.

**3단계: GitHub Release 생성**

매니페스트 업데이트가 완료되면, 배포 이력 추적을 위해 GitHub Release를 자동 생성한다. 이전 태그와의 diff URL, 커밋 목록, 배포 시각이 포함된다.

```yaml
- name: Create GitHub release
  uses: softprops/action-gh-release@v2
  with:
    tag_name: ${{ steps.compute_diff.outputs.new_tag }}
    name: Deploy my-backend ${{ steps.compute_diff.outputs.new_tag }}
    body_path: ./release_body.md    # 커밋 목록, diff URL, 배포 시각
```

이후 ArgoCD가 my-cluster 저장소의 매니페스트 변경을 감지하고 클러스터에 적용한다. prod 배포에는 n8n + Slack을 통한 승인 게이트가 있는데, 이 부분은 별도 포스트에서 다룰 예정이다.

### Before/After 비교

| | ECS (Before) | EKS (After) |
|---|---|---|
| **배포 트리거** | `aws ecs update-service --force-new-deployment` | ArgoCD sync (자동/수동) |
| **이미지 추적** | mutable 태그만 사용 | prod: immutable (`prod-YYMMDD-HHMM`) |
| **Blue/Green** | ALB API로 라우팅 룰 직접 조작 | HTTPRoute weight 한 줄 변경 |
| **롤백** | 이전 Task Definition 리비전으로 수동 롤백 | 이전 태그로 kustomize edit 또는 weight 전환 |
| **배포 승인** | 없음 (push하면 바로 배포) | n8n + Slack 승인 게이트 |
| **배포 기록** | CloudTrail에서 추적 | GitHub Release + Git 커밋 히스토리 |
| **모니터링 에이전트** | Datadog Java Agent | OpenTelemetry Java Agent |
| **알림** | 커스텀 Slack Action (reaction 기반) | ArgoCD Notifications (배포 성공/실패 자동) |

## 삽질했던 것들

### readiness probe 타이밍

Spring Boot 앱이 완전히 뜨기까지 40~60초 정도 걸리는데, 처음에 `initialDelaySeconds`를 20초로 잡았더니 ArgoCD가 "Degraded"로 판단하고 자동 롤백을 했다. Pod이 뜨자마자 readiness check가 실패하니 "이 배포는 문제가 있다"고 판단한 것이다.

```yaml
# Before - 실패
readinessProbe:
  initialDelaySeconds: 20   # Spring Boot 기동 전에 체크 시작
  periodSeconds: 5

# After - 성공
readinessProbe:
  initialDelaySeconds: 40   # 충분한 여유
  periodSeconds: 10
  failureThreshold: 5       # 5번까지 실패 허용
```

`failureThreshold`도 같이 올려서 간헐적인 실패에도 바로 롤백되지 않도록 했다.

### Gateway API allowedRoutes 설정

처음에 Gateway를 networking namespace에 만들고, HTTPRoute는 각 환경 namespace(dev, prod)에 만들었더니 라우팅이 안 됐다. Gateway의 `allowedRoutes.namespaces.from`이 기본값인 `Same`이라서 같은 namespace의 HTTPRoute만 연결됐기 때문이다.

```yaml
# 반드시 All로 설정해야 다른 namespace의 HTTPRoute가 연결됨
allowedRoutes:
  namespaces:
    from: All
```

이거 빠뜨리면 HTTPRoute가 아무리 올바르게 정의되어 있어도 Gateway에 연결이 안 되서, ALB에 Target Group이 생성되지 않는다.

### Karpenter consolidation과 PDB 충돌

Karpenter의 `consolidateAfter: 30s`를 prod에도 그대로 적용했더니, 트래픽이 줄어드는 시간대에 노드가 내려가면서 서비스가 잠깐씩 흔들렸다. PodDisruptionBudget을 설정하지 않았기 때문이다.

```yaml
# podbudget.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: my-backend-prod-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: my-backend-prod
```

PDB로 "최소 1개 Pod은 항상 살아있어야 한다"를 보장하니, Karpenter가 노드를 정리할 때도 워크로드 이동을 먼저 하고 나서 노드를 내린다.

### LoadRestrictionsNone

my-web의 Blue/Green routes overlay에서 다른 overlay(blue, green)의 Service를 참조하는데, Kustomize는 기본적으로 다른 overlay 리소스를 참조하는 걸 막는다. 배포 시 `--load-restrictor=LoadRestrictionsNone` 옵션을 줘야 했다.

```bash
kubectl apply -k my-web/overlays/routes --load-restrictor=LoadRestrictionsNone
```

## ECS에서의 전환 과정

한 번에 전환한 게 아니라 단계적으로 진행했다.

```mermaid
flowchart LR
    A["1단계<br/>dev 환경<br/>EKS 구성"] --> B["2단계<br/>stage 이전<br/>검증"]
    B --> C["3단계<br/>prod 병행 운영<br/>ECS + EKS"]
    C --> D["4단계<br/>prod 전환<br/>ECS 제거"]
```

1. **dev 환경을 먼저 EKS로 구성** - Kustomize 구조, Gateway API, Karpenter를 dev에서 먼저 검증
2. **stage를 EKS로 이전** - CI/CD 파이프라인 연동, ArgoCD 자동 배포 검증
3. **prod 병행 운영** - ECS와 EKS 양쪽에 동시 배포하면서 안정성 확인
4. **ECS 완전 제거** - ECS Task Definition, ALB 라우팅 룰, deploy-blue/green.yml 워크플로우 폐기

실제로 my-backend의 `deploy-blue.yml`을 보면 ECS update 코드가 주석 처리되어 있다. 전환 완료 후 남겨둔 흔적이다.

## 성과

- **인프라 설정 100% Git 관리** - 콘솔 작업 제로. "지금 prod 설정이 뭐지?" → Git 보면 됨
- **배포 소요 시간 단축** - ECS 배포는 Task Definition 교체부터 서비스 안정화까지 10분 넘게 걸렸는데, EKS로 전환 후 5분 이내로 줄었다
- **노드 비용 절감** - ARM64 인스턴스 + Karpenter 자동 정리로 야간/주말 노드 비용 감소
- **Blue/Green 배포 간소화** - ALB 라우팅 룰 조작 → YAML weight 한 줄 변경
- **모니터링 통합** - OTel 사이드카로 모든 Pod에서 일관된 로그·트레이스·메트릭 수집

## 마무리

ECS에서 EKS로의 마이그레이션은 단순히 컨테이너 오케스트레이터를 바꾼 게 아니었다. **인프라를 코드로 선언적으로 관리하는 체계**를 만든 것이다.

Kustomize의 base/overlay 패턴으로 환경별 설정을 깔끔하게 분리하고, Gateway API로 트래픽 라우팅을 표준화하고, Karpenter로 노드 관리를 자동화했다. 이 위에 ArgoCD를 얹어서 Git = 클러스터 상태가 되도록 만들었다.

우리 팀에는 전담 인프라 담당자가 없다. 개발자가 인프라를 직접 구성하고 운영해야 하는 상황이기 때문에, 이번 마이그레이션에서 가장 신경 쓴 건 **개발자 경험(DX)** 이었다. 인프라를 몰라도 배포할 수 있고, Git만 보면 현재 상태를 알 수 있고, 문제가 생기면 YAML 한 줄로 롤백할 수 있는 구조. Kustomize overlay, HTTPRoute weight, ArgoCD Image Updater 같은 선택들이 전부 이 방향에서 나온 결정이었다.

돌이켜보면, 가장 중요했던 건 **한 번에 전환하지 않은 것**이다. dev → stage → prod 순서로 단계적으로 이전하면서 각 단계에서 문제를 잡았다. prod 병행 운영 기간에 실제 트래픽을 받으면서 검증한 게 안전한 전환에 결정적이었다.
