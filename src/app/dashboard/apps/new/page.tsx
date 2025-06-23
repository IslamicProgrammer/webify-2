'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { CreateBotForm } from '@/components/forms/create-bot-form';

export default function CreateBotPage() {
  return (
    <>
      <DashboardHeader title="Create New Bot" description="Set up your Telegram bot in a few simple steps" />

      <main className="flex-1 overflow-auto p-6">
        <CreateBotForm />
      </main>
    </>
  );
}
