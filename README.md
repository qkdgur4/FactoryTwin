# FactoryTwin

FactoryTwin은 브라우저에서 실행되는 산업 설비 디지털 트윈 관제 대시보드입니다. 실제 하드웨어, 백엔드, 데이터베이스, WebSocket 없이도 3D 공장 씬과 실시간 센서 시뮬레이션을 통해 설비 상태, 경고, 온도 추이, 운영 로그를 확인할 수 있도록 설계되었습니다.

이 저장소의 v1 목표는 데모용 랜딩 페이지가 아니라, 첫 화면부터 바로 사용할 수 있는 관제 화면을 제공하는 것입니다. 사용자는 3D 공장 바닥 위의 세 설비를 선택하고, 온도와 진동, 가동률, 경고 상태, 최근 로그를 한 화면에서 확인할 수 있습니다.

## 주요 기능

- Three.js 기반 3D 공장 씬
- `id-1`, `id-2`, `id-3` 세 설비의 실시간 상태 표시
- 박스와 실린더 등 기본 primitive geometry로 구성한 추상 설비 모델
- 설비 hover, click, 선택 상태, 카메라 타깃 이동
- 온도 80도 초과 시 3D 모델과 대시보드에서 경고 표시
- Drei `Html` 기반 설비 상태 라벨
- 1초 단위 브라우저 내부 센서 시뮬레이션
- 온도, 진동, 가동률 추적
- 최근 20초 온도 이력 차트
- 최근 50개 운영 로그 유지
- 선택 설비 상세 모달과 시작/정지 제어
- 데스크톱 좌우 분할 레이아웃, 모바일 상하 스택 레이아웃

## 기술 스택

- Vite
- React
- TypeScript
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- Tailwind CSS
- Lucide React
- Recharts
- Vitest
- Playwright Core

## 아키텍처 개요

FactoryTwin은 프론트엔드 단일 애플리케이션으로 구성되어 있습니다. 설비 데이터는 외부 시스템에서 수신하지 않고, `MachineDataContext`가 브라우저 내부에서 주기적으로 갱신합니다. UI는 3D 시각화 영역과 실시간 관제 패널로 나뉘며, 두 영역은 동일한 컨텍스트 상태를 공유합니다.

핵심 상태 흐름은 다음과 같습니다.

1. `machineSimulation.ts`가 초기 설비 상태와 다음 센서 값을 계산합니다.
2. `MachineDataContext.tsx`가 1초마다 설비 상태, 온도 이력, 로그를 갱신합니다.
3. `FactoryScene.tsx`와 `Dashboard.tsx`가 같은 컨텍스트 데이터를 구독합니다.
4. 사용자가 설비를 클릭하면 선택 상태가 갱신되고, 3D 카메라와 상세 모달이 함께 반응합니다.
5. 사용자가 시작/정지 명령을 실행하면 해당 설비의 상태와 로그가 즉시 갱신됩니다.

## 프로젝트 구조

```text
src/
  App.tsx
  main.tsx
  index.css
  types/
    machine.ts
  utils/
    machineSimulation.ts
    machineSimulation.test.ts
  context/
    MachineDataContext.tsx
    machineDataContextValue.ts
    useMachineData.ts
  components/
    FactoryScene.tsx
    Machine.tsx
    Dashboard.tsx
    MachineModal.tsx
scripts/
  verify-render.mjs
docs/
  digital-twin-dashboard-plan.md
```

## 주요 모듈 설명

`src/types/machine.ts`

설비 ID, 상태, 센서 데이터, 온도 이력, 로그 타입을 정의합니다. 애플리케이션 전반의 데이터 계약 역할을 합니다.

`src/utils/machineSimulation.ts`

설비별 초기값과 센서 변화 규칙을 관리합니다. 정지 상태에서는 온도, 진동, 가동률이 낮은 값으로 수렴하고, 온도가 80도를 초과하면 경고 상태가 됩니다. 온도 이력은 20개, 로그는 50개로 제한됩니다.

`src/context/MachineDataContext.tsx`

실시간 상태의 중심입니다. 1초마다 시뮬레이션을 실행하고, 설비 상태, 온도 이력, 경고 설비 목록, 로그, 시작/정지 액션을 React Context로 제공합니다.

`src/components/FactoryScene.tsx`

React Three Fiber 캔버스, 조명, 바닥, OrbitControls, 카메라 이동 로직을 담당합니다. 선택된 설비가 있으면 카메라와 OrbitControls target이 해당 설비 방향으로 부드럽게 이동합니다.

`src/components/Machine.tsx`

각 설비의 3D 모델을 렌더링합니다. hover와 선택 상태에 따라 색상과 edge가 바뀌며, 경고 상태에서는 빨간 점멸과 point light가 표시됩니다.

`src/components/Dashboard.tsx`

실시간 관제 패널입니다. 설비 카드, 임계치 알림, 온도 차트, 로그 캐스터, 선택 설비 시작/정지 버튼을 렌더링합니다.

`src/components/MachineModal.tsx`

선택된 설비의 상세 상태를 보여주고, 가동 중지 또는 재시작 명령을 실행합니다.

## 실행 방법

이 프로젝트는 Windows PowerShell 환경을 기준으로 합니다. PowerShell에서 `npm.ps1` 실행 정책 문제가 발생할 수 있으므로 `npm` 대신 `npm.cmd`를 사용합니다.

```powershell
npm.cmd install
npm.cmd run dev
```

개발 서버는 기본적으로 다음 주소에서 실행됩니다.

```text
http://127.0.0.1:5173/
```

## 검증 명령

```powershell
npm.cmd run lint
npm.cmd test -- --run
npm.cmd run build
```

브라우저 렌더링 검증:

```powershell
npm.cmd run dev
npm.cmd run verify:render
```

`verify:render`는 실제 Chrome을 headless 모드로 실행해 데스크톱과 모바일 뷰포트에서 캔버스가 비어 있지 않은지, 대시보드 텍스트와 설비 라벨이 표시되는지, 모달과 정지 버튼이 동작하는지 확인합니다.

현재 스크립트는 Chrome 경로를 아래 위치로 가정합니다.

```text
C:\Program Files\Google\Chrome\Application\chrome.exe
```

렌더 검증 스크린샷은 다음 경로에 저장됩니다.

```text
C:\tmp\FactoryTwin-render-check
```

## 시뮬레이션 규칙

- 센서 데이터는 1초마다 갱신됩니다.
- 각 설비는 온도, 진동, 가동률을 가집니다.
- 온도 이력은 최신 20초만 유지합니다.
- 로그는 최신 50개만 유지합니다.
- 온도가 80도를 초과하면 경고 상태가 됩니다.
- 정지된 설비는 낮은 가동률과 안정적인 센서 값으로 점진적으로 수렴합니다.
- 모든 데이터는 브라우저 내부에서 생성되며 외부 시스템과 통신하지 않습니다.

## UI 원칙

FactoryTwin의 UI는 어두운 산업 관제실 스타일을 기준으로 합니다. 화면은 장식적인 마케팅 페이지가 아니라 반복적으로 상태를 확인하고 조작하는 작업용 대시보드에 맞춰 구성되어 있습니다.

- 첫 화면은 바로 사용할 수 있는 관제 화면입니다.
- 데스크톱에서는 3D 씬을 왼쪽, 대시보드를 오른쪽에 배치합니다.
- 모바일에서는 3D 씬과 대시보드를 세로로 쌓습니다.
- 과도한 장식, 히어로 섹션, 중첩 카드 구조를 피합니다.
- 긴 텍스트는 말줄임 처리하고, 좁은 화면에서도 버튼과 라벨이 겹치지 않도록 구성합니다.

## v1 범위

v1에서 포함하지 않는 항목은 의도적으로 제외된 범위입니다.

- 백엔드 API
- 데이터베이스
- WebSocket
- 실제 PLC, 센서, 로봇, 생산 설비 연동
- 인증과 사용자 권한
- GLTF 또는 외부 3D 자산 로딩
- 운영 환경 배포 파이프라인

이 제한은 데모 품질을 낮추기 위한 것이 아니라, 디지털 트윈 대시보드의 핵심 상호작용과 상태 흐름을 먼저 안정적으로 검증하기 위한 설계 결정입니다.

## 개발 메모

- 새 의존성은 대시보드 동작에 직접 필요할 때만 추가합니다.
- 설비 데이터와 제어 상태는 현재 React Context와 custom hook으로 충분히 관리합니다.
- 시뮬레이션 로직은 UI 컴포넌트와 분리해 테스트 가능한 순수 함수 중심으로 유지합니다.
- 3D 씬은 기본 geometry를 사용해 가볍고 예측 가능하게 유지합니다.
- 변경 후에는 최소한 lint, test, build를 실행한 뒤 수동 화면 확인을 진행합니다.

## 라이선스

현재 라이선스 파일은 포함되어 있지 않습니다. 배포 또는 외부 공개 전에 프로젝트 목적에 맞는 라이선스를 추가해야 합니다.
