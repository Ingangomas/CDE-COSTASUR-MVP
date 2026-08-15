import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { Login } from "./pages/Login";
import { DocumentViewerPage } from "./pages/DocumentViewerPage";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { ProjectDetails } from "./pages/ProjectDetails";
import { ArchitectPortal } from "./pages/ArchitectPortal";
import { TechnicalReview } from "./pages/TechnicalReview";
import { RevisionTecnicaProyectos } from "./pages/RevisionTecnicaProyectos";
import { RevisionTecnicaProjectDetails } from "./pages/RevisionTecnicaProjectDetails";
import { ControlDeObras } from "./pages/ControlDeObras";
import { ControlDeObrasProyectos } from "./pages/ControlDeObrasProyectos";
import { ControlDeObrasProjectDetails } from "./pages/ControlDeObrasProjectDetails";
import { ContractorPortal } from "./pages/ContractorPortal";
import { DepartmentDashboard } from "./pages/DepartmentDashboard";
import { DashboardAnalytics } from "./pages/DashboardAnalytics";
import { AdminMapaGeneral } from "./pages/AdminMapaGeneral";
import { AdminProyectos } from "./pages/AdminProyectos";
import { AdminDepartamentos } from "./pages/AdminDepartamentos";
import { DepartmentProyectos } from "./pages/DepartmentProyectos";
import { DepartmentProjectDetails } from "./pages/DepartmentProjectDetails";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<RequireAuth />}>
        <Route path="/propietario" element={<Layout role="propietario" />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="mis-propiedades" element={<OwnerDashboard />} />
          <Route path="mis-propiedades/:id" element={<ProjectDetails />} />
          <Route path="mis-propiedades/:id/documentos/:documentId" element={<DocumentViewerPage />} />
        </Route>
        
        <Route path="/arquitecto" element={<Layout role="arquitecto" />}>
          <Route index element={<DashboardAnalytics role="arquitecto" />} />
          <Route path="mis-proyectos" element={<ArchitectPortal />} />
        </Route>

        <Route path="/contratista" element={<Layout role="contratista" />}>
          <Route index element={<DashboardAnalytics role="contratista" />} />
          <Route path="obras-activas" element={<ContractorPortal />} />
        </Route>
        
        <Route path="/revision-tecnica" element={<Layout role="revision-tecnica" />}>
          <Route index element={<DashboardAnalytics role="revision-tecnica" />} />
          <Route path="revision" element={<TechnicalReview />} />
          <Route path="proyectos" element={<RevisionTecnicaProyectos />} />
          <Route path="proyectos/:id" element={<RevisionTecnicaProjectDetails />} />
        </Route>
        
        <Route path="/control-obras" element={<Layout role="control-obras" />}>
          <Route index element={<DashboardAnalytics role="control-obras" />} />
          <Route path="control" element={<ControlDeObras />} />
          <Route path="proyectos" element={<ControlDeObrasProyectos />} />
          <Route path="proyectos/:id" element={<ControlDeObrasProjectDetails />} />
        </Route>

        <Route path="/legal" element={<Layout role="legal" />}>
          <Route index element={<DashboardAnalytics role="legal" />} />
          <Route path="validaciones" element={<DepartmentDashboard department="Legal" icon="gavel" type="validaciones legales y verificación de propietarios" deptKey="legal" />} />
          <Route path="proyectos" element={<DepartmentProyectos department="Legal" deptKey="legal" />} />
          <Route path="proyectos/:id" element={<DepartmentProjectDetails department="Legal" deptKey="legal" />} />
        </Route>

        <Route path="/electrica" element={<Layout role="electrica" />}>
          <Route index element={<DashboardAnalytics role="electrica" />} />
          <Route path="revision" element={<DepartmentDashboard department="Ingeniería Eléctrica" icon="electrical_services" type="revisión de planos eléctricos" deptKey="electrica" />} />
          <Route path="proyectos" element={<DepartmentProyectos department="Eléctrica" deptKey="electrica" />} />
          <Route path="proyectos/:id" element={<DepartmentProjectDetails department="Eléctrica" deptKey="electrica" />} />
        </Route>

        <Route path="/hidrosanitaria" element={<Layout role="hidrosanitaria" />}>
          <Route index element={<DashboardAnalytics role="hidrosanitaria" />} />
          <Route path="revision" element={<DepartmentDashboard department="Ing. Hidrosanitaria" icon="plumbing" type="revisión de planos hidrosanitarios" deptKey="hidrosanitaria" />} />
          <Route path="proyectos" element={<DepartmentProyectos department="Hidrosanitaria" deptKey="hidrosanitaria" />} />
          <Route path="proyectos/:id" element={<DepartmentProjectDetails department="Hidrosanitaria" deptKey="hidrosanitaria" />} />
        </Route>

        <Route path="/paisajismo" element={<Layout role="paisajismo" />}>
          <Route index element={<DashboardAnalytics role="paisajismo" />} />
          <Route path="revision" element={<DepartmentDashboard department="Paisajismo" icon="park" type="revisión de planos de jardinería" deptKey="paisajismo" />} />
          <Route path="proyectos" element={<DepartmentProyectos department="Paisajismo" deptKey="paisajismo" />} />
          <Route path="proyectos/:id" element={<DepartmentProjectDetails department="Paisajismo" deptKey="paisajismo" />} />
        </Route>

        <Route path="/mensura" element={<Layout role="mensura" />}>
          <Route index element={<DashboardAnalytics role="mensura" />} />
          <Route path="revision" element={<DepartmentDashboard department="Mensura" icon="straighten" type="revisión topográfica y deslindes" deptKey="mensura" />} />
          <Route path="proyectos" element={<DepartmentProyectos department="Mensura" deptKey="mensura" />} />
          <Route path="proyectos/:id" element={<DepartmentProjectDetails department="Mensura" deptKey="mensura" />} />
        </Route>

        <Route path="/seguridad" element={<Layout role="seguridad" />}>
          <Route index element={<DashboardAnalytics role="seguridad" />} />
          <Route path="revision" element={<DepartmentDashboard department="Seguridad y Guardianes" icon="security" type="control de accesos y seguridad de obra" deptKey="seguridad" />} />
          <Route path="proyectos" element={<DepartmentProyectos department="Seguridad" deptKey="seguridad" />} />
          <Route path="proyectos/:id" element={<DepartmentProjectDetails department="Seguridad" deptKey="seguridad" />} />
        </Route>
        <Route path="/admin" element={<Layout role="admin" />}>
          <Route index element={<DashboardAnalytics role="admin" />} />
          <Route path="mapa" element={<AdminMapaGeneral />} />
          <Route path="proyectos" element={<AdminProyectos />} />
          <Route path="departamentos" element={<AdminDepartamentos />} />
          <Route path="proyectos/:id" element={<ControlDeObrasProjectDetails />} /> 
        </Route>
        </Route>
      </Routes>
    </Router>
  );
}







