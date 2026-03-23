# Cây thư mục dự án SMART_AGRICULTURE

Dưới đây là cây thư mục chính của workspace (tổng quan từ trạng thái hiện tại):

.
├── README.md
├── Client/
│   ├── package.json
│   └── my-farm-frontend/
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.js
│       ├── README.md
│       ├── tailwind.config.js
│       ├── tsconfig.app.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       ├── public/
│       └── src/
│           ├── App.css
│           ├── App.tsx
│           ├── index.css
│           ├── main.tsx
│           ├── vite-env.d.ts
│           ├── assets/
│           ├── components/
│           │   ├── bar/
│           │   │   └── StageProgressBar.tsx
│           │   ├── cards/
│           │   │   ├── LogCard.tsx
│           │   │   └── WorkflowStageCard.tsx
│           │   └── layout/
│           │       ├── Footer.tsx
│           │       ├── Header.tsx
│           │       ├── MainLayout.tsx
│           │       └── Sidebar.tsx
│           ├── models/
│           │   ├── Batch.ts
│           │   └── Task.ts
│           ├── pages/
│           │   ├── ai-assistant/
│           │   │   └── ImageAnalysis.tsx
│           │   ├── auth/
│           │   │   ├── Login.tsx
│           │   │   ├── Register.tsx
│           │   │   └── VerifyEmail.tsx
│           │   ├── batches/
│           │   │   ├── BatchCreation.tsx
│           │   │   ├── BatchDetail.tsx
│           │   │   ├── BatchLifecycle.tsx
│           │   │   └── BatchList.tsx
│           │   ├── dashboard/
│           │   │   └── Dashboard.tsx
│           │   ├── inventory/
│           │   │   └── Inventory.tsx
│           │   ├── processes/
│           │   │   └── GrowthProcess.tsx
│           │   ├── settings/
│           │   │   └── Settings.tsx
│           │   └── tasks/
│           │       ├── FarmingCalendar.tsx
│           │       └── TaskManagement.tsx
│           ├── route/
│           │   └── AppRoute.tsx
│           ├── services/
│           │   └── authService.ts
│           └── utils/
│               └── DataUitls.ts
└── Server/
    └── farm-manager-api/
        ├── generate_api.js
        ├── mvnw
        ├── mvnw.cmd
        ├── package.json
        ├── pom.xml
        └── src/
            ├── main/
            │   ├── java/
            │   │   └── com/
            │   │       └── smartfarm/
            │   │           └── api/
            │   │               ├── FarmManagerApplication.java
            │   │               ├── config/
            │   │               ├── controller/
            │   │               ├── dto/
            │   │               ├── entity/
            │   │               ├── mapper/
            │   │               ├── repository/
            │   │               └── service/
            │   └── resources/
            │       └── application.properties
            └── test/
                └── java/
                    └── com/
                        └── smartfarm/
                            └── api/

# Ghi chú
- File này phản ánh cấu trúc chính từ snapshot workspace hiện tại. Nếu bạn muốn cây thư mục cập nhật trực tiếp từ hệ thống file, tôi có thể quét toàn bộ workspace và cập nhật file này.
