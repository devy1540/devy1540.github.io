# 개발 프로세스 필수 룰

## QA 검토 필수 프로세스

### 🚨 **CRITICAL RULE: QA-FIRST DEPLOYMENT**

**모든 Story는 다음 순서를 엄격히 준수해야 함:**

1. **Draft** → 2. **Approved** → 3. **InProgress** → 4. **Review** → 5. **QA 검토 완료** → 6. **Done** → 7. **배포 승인** → 8. **배포**

### 📋 **필수 QA 검토 항목**

#### Story가 "Review" 상태가 되면:
- [ ] QA 에이전트 리뷰 요청 필수
- [ ] 모든 Acceptance Criteria 검증
- [ ] 코드 품질 검토 (ESLint, TypeScript, Tests)
- [ ] 접근성 검증 (WCAG AA)
- [ ] 성능 검증
- [ ] 보안 검토
- [ ] 브라우저 호환성 확인

#### QA 검토 완료 후에만:
- [ ] Story 상태를 "Done"으로 변경 가능
- [ ] 배포 승인 요청 가능
- [ ] Git push 허용

### ⛔ **금지 사항**

**절대 금지:**
- QA 검토 없이 "Done" 상태 변경
- QA 검토 없이 Git push
- QA 검토 없이 배포 진행
- 승인 없이 main 브랜치 병합

### 🔄 **위반 시 조치**

**프로세스 위반 발견 시:**
1. 즉시 Story 상태를 "Review"로 되돌리기
2. 위반 사실 Change Log에 기록
3. QA 검토 완료까지 배포 중단
4. 프로세스 개선사항 논의

### 📝 **QA 검토 템플릿**

```markdown
## QA Results

### Review Date: YYYY-MM-DD
### Reviewed By: [QA Agent Name]

### Code Quality Assessment
[코드 품질 평가]

### Refactoring Performed  
[수행된 리팩토링]

### Compliance Check
[규정 준수 확인]

### Security Review
[보안 검토]

### Performance Considerations
[성능 고려사항]

### Final Status
[ ] ✅ Approved - Ready for Done
[ ] ⚠️ Approved with Minor Issues
[ ] ❌ Needs Revision
```

### 🎯 **책임 분담**

- **Scrum Master**: 프로세스 준수 감시, 룰 집행
- **Dev Agent**: Review 상태로만 완료, QA 요청
- **QA Agent**: 필수 검토 후 최종 승인
- **승인자**: QA 완료 후 배포 최종 결정

---

**이 룰은 즉시 효력을 발휘하며, 모든 향후 Story에 적용됩니다.**
