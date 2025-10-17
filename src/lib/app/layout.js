"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
const toaster_1 = require("@/components/ui/toaster");
const utils_1 = require("@/lib/utils");
const firebase_1 = require("@/firebase");
exports.metadata = {
    title: 'Clockwork',
    description: 'Seguimiento de Asistencia en Tiempo Real',
};
function RootLayout({ children, }) {
    return (<html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className={(0, utils_1.cn)("font-body antialiased", process.env.NODE_ENV === "development" ? "debug-screens" : undefined)}>
        <firebase_1.FirebaseClientProvider>
          {children}
        </firebase_1.FirebaseClientProvider>
        <toaster_1.Toaster />
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map