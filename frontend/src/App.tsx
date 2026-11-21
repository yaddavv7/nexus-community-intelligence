import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { Navbar } from './components/Navbar';
import { DemoModal } from './components/DemoModal';
import { NotificationDrawer } from './components/NotificationDrawer';

// 19 Views
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { SubmitReportPage } from './pages/SubmitReportPage';
import { IntelligenceMapPage } from './pages/IntelligenceMapPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { CommunityInsightsPage } from './pages/CommunityInsightsPage';
import { RiskTimelinePage } from './pages/RiskTimelinePage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import { VolunteerDashboardPage } from './pages/VolunteerDashboardPage';
import { AdminCommandCentrePage } from './pages/AdminCommandCentrePage';
import { IncidentManagementPage } from './pages/IncidentManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AnalyticsReportsPage } from './pages/AnalyticsReportsPage';
import { NotificationCentrePage } from './pages/NotificationCentrePage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

export const MainAppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const handleViewIncident = (id: number) => {
    setSelectedIncidentId(id);
    setCurrentTab('incident-detail');
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'landing':
        return <LandingPage onSelectTab={setCurrentTab} />;
      case 'login':
        return <LoginPage onSelectTab={setCurrentTab} />;
      case 'register':
        return <RegisterPage onSelectTab={setCurrentTab} />;
      case 'citizen-dash':
        return (
          <CitizenDashboardPage
            onSelectTab={setCurrentTab}
            onViewIncident={handleViewIncident}
          />
        );
      case 'report':
        return (
          <SubmitReportPage
            onSelectTab={setCurrentTab}
            onViewIncident={handleViewIncident}
          />
        );
      case 'map':
        return <IntelligenceMapPage onViewIncident={handleViewIncident} />;
      case 'incident-detail':
        return (
          <IncidentDetailPage
            incidentId={selectedIncidentId || 1}
            onBack={() => setCurrentTab('map')}
            onNavigateDetail={handleViewIncident}
          />
        );
      case 'my-reports':
        return (
          <MyReportsPage
            onViewIncident={handleViewIncident}
            onSelectTab={setCurrentTab}
          />
        );
      case 'insights':
        return <CommunityInsightsPage />;
      case 'timeline':
        return <RiskTimelinePage />;
      case 'voice':
        return <VoiceAssistantPage onViewIncident={handleViewIncident} />;
      case 'volunteer':
        return <VolunteerDashboardPage onViewIncident={handleViewIncident} />;
      case 'admin':
        return (
          <AdminCommandCentrePage
            onViewIncident={handleViewIncident}
            onSelectTab={setCurrentTab}
          />
        );
      case 'incidents':
        return <IncidentManagementPage onViewIncident={handleViewIncident} />;
      case 'users':
        return <UserManagementPage />;
      case 'analytics':
        return <AnalyticsReportsPage />;
      case 'notifications':
        return <NotificationCentrePage onViewIncident={handleViewIncident} />;
      case 'settings':
        return <SettingsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <LandingPage onSelectTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-nexus-950 text-slate-100">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      <main className="flex-1">{renderActiveView()}</main>

      {/* Global Interactive Intelligence Demo Modal */}
      <DemoModal />

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onNavigateDetail={handleViewIncident}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <MainAppContent />
      </DemoProvider>
    </AuthProvider>
  );
}
