import { GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

// 1. Data Provider Import
import dataProvider from "@refinedev/simple-rest"; 

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import Dashboard from "./pages/Dashboard";
import { BookOpen, Home } from "lucide-react";
import { ThemedLayout } from "@refinedev/antd";

import Subjectslist from "./pages/subject/list";
import SubjectCreate from "./pages/subject/create";

// Hardcoded API URL
const API_URL = "http://localhost:8000/api";

function App() {
  // --- CUSTOM DATA PROVIDER LOGIC START ---
  const baseDataProvider = dataProvider(API_URL);

  const myDataProvider = {
    ...baseDataProvider,
    getList: async ({ resource, pagination, filters, sorters, meta }: any) => {
      const response = await fetch(`${API_URL}/${resource}`);
      const json = await response.json();

      // Agar backend se data key mein array aa raha hai to wo return karein
      return {
        data: json.data || [], 
        total: json.pagination?.total || json.data?.length || 0,
      };
    },
  };
  // --- CUSTOM DATA PROVIDER LOGIC END ---

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              // Ab yahan 'myDataProvider' use hoga
              dataProvider={myDataProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "8BJFOJ-7F6vKD-pJzury",
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "home", icon: <Home /> },
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  meta: { label: "subjects", icon: <BookOpen /> },
                },
              ]}
            >
              <Routes>
                <Route
                  element={
                    <ThemedLayout>
                      <Outlet />
                    </ThemedLayout>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="/subjects">
                    <Route index element={<Subjectslist />} />
                    <Route path="create" element={<SubjectCreate />} />
                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;