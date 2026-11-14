/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthScreen } from './components/auth/AuthScreen';
import { SplashOnboarding } from './components/auth/SplashOnboarding';
import { AppShell } from './components/layout/AppShell';
import { GlobalInspectors } from './components/ui/GlobalInspectors';
import { AlertsView } from './components/views/AlertsView';
import { DashboardView } from './components/views/DashboardView';
import { DevicesView } from './components/views/DevicesView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';
import { ReportsView } from './components/views/ReportsView';
import { RiskAssessmentView } from './components/views/RiskAssessmentView';
import { ThreatIntelView } from './components/views/ThreatIntelView';
import { TrafficPortView } from './components/views/TrafficPortView';
import { AppProvider, useApp } from './context/AppContext';

const ActiveWorkspace: React.FC = () => {
  const { stage, activeTab } = useApp();

  if (stage === 'splash-onboarding') {
    return <SplashOnboarding />;
  }

  if (stage === 'auth') {
    return <AuthScreen />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'devices':
        return <DevicesView initialFilter="all" />;
      case 'unknown-devices':
        return <DevicesView initialFilter="unknown" />;
      case 'traffic':
        return <TrafficPortView defaultSubTab="traffic" />;
      case 'port-scans':
        return <TrafficPortView defaultSubTab="port-scans" />;
      case 'threat-intel':
        return <ThreatIntelView />;
      case 'alerts':
        return <AlertsView />;
      case 'risk-assessment':
        return <RiskAssessmentView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <ProfileSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppShell>
      {renderTab()}
      <GlobalInspectors />
    </AppShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ActiveWorkspace />
    </AppProvider>
  );
}
