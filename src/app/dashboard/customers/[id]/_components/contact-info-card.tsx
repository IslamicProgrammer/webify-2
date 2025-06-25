'use client';

import { Globe, MessageCircle, Phone } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactInfoCardProps {
  customer: any;
}

export function ContactInfoCard({ customer }: ContactInfoCardProps) {
  const contactFields = [
    {
      label: 'Telegram Username',
      value: customer.username ? `@${customer.username}` : 'Not provided',
      icon: MessageCircle,
      available: !!customer.username
    },
    {
      label: 'Phone Number',
      value: customer.phoneNumber || 'Not provided',
      icon: Phone,
      available: !!customer.phoneNumber
    },
    {
      label: 'Preferred Language',
      value: customer.languageCode ? customer.languageCode.toUpperCase() : 'Not specified',
      icon: Globe,
      available: !!customer.languageCode
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-lg bg-green-500/10 p-2">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          Contact Information
        </CardTitle>
        <CardDescription>Available contact methods and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contactFields.map((field, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <field.icon className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
            </div>
            <div className={`rounded-lg border p-3 transition-colors ${field.available ? 'border-border bg-muted/50' : 'border-dashed border-muted-foreground/30 bg-muted/20'}`}>
              <span className={`text-sm ${field.available ? 'font-mono font-medium' : 'italic text-muted-foreground'}`}>{field.value}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
