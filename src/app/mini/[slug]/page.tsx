'use client';

// In your Next.js Mini App (page.tsx) inside the app directory
import { useEffect, useState } from 'react';
import { on, postEvent } from '@telegram-apps/sdk';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

const MiniAppPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [phone, setPhone] = useState('test phone');

  // const hash = window.location.hash.slice(1);

  // alert(hash); // tgWebAppData=...&tgWebAppVersion=6.2&...

  // const params = new URLSearchParams(hash);

  // alert(params.get('tgWebAppVersion')); // "6.2"

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     // Check if WebApp is available in the current environment (Telegram web app)
  //     postEvent('web_app_request_phone');
  //   }
  // }, []);

  useEffect(() => {
    let listener;

    if (typeof window !== 'undefined') {
      listener = on('phone_requested', data => {
        alert(JSON.stringify(data));
        setPhone(data as any);
      });
    }

    return listener?.();
  }, []);

  // const requestPhone = () => {
  //   if (window.Telegram.WebApp) {
  //     // Trigger phone number request from Telegram
  //     window.Telegram.WebApp.requestPhone({
  //       onSuccess: phoneNumber => {
  //         // Handle the phone number received
  //         console.log('Phone number received:', phoneNumber);
  //         // You can now save this phone number to your database or use it in your app
  //       },
  //       onError: error => {
  //         // Handle errors if any
  //         console.error('Error requesting phone number:', error);
  //       }
  //     });
  //   }
  // };

  // useEffect(() => {
  //   requestPhone();
  // }, [requestPhone, window]);

  // useEffect(() => {
  //   // Retrieve and decode the Telegram user data from the URL

  //   if (typeof window !== 'undefined') {
  //     const { initDataRaw } = retrieveLaunchParams();

  //     console.log(initDataRaw);
  //     // alert(JSON.stringify(initDataRaw));

  //     if (initDataRaw) {
  //       setUserData(initDataRaw);

  //       // Optionally, store user data and authenticate them automatically
  //       // You could send this data to your backend to create or update the user record
  //       // fetch('/api/auth/telegram-login', {
  //       //   method: 'POST',
  //       //   headers: {
  //       //     'Content-Type': 'application/json'
  //       //   },
  //       //   body: JSON.stringify(user)
  //       // });
  //     }
  //   }
  // }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-6 py-12 sm:px-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-semibold text-gray-800">Welcome to the Mini App</h1>
        <Button onClick={() => postEvent('web_app_request_phone')}>Share phone number</Button>
        {phone}
        {JSON.stringify(userData)}
        {userData ? (
          <div className="text-center">
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://t.me/${userData?.username}/photo.jpg`} alt="Profile" className="mx-auto mb-4 h-24 w-24 rounded-full" />
              <h2 className="text-2xl font-medium text-gray-800">{userData?.first_name}</h2>
              <p className="text-sm text-gray-600">{userData?.username}</p>
            </div>
            <script
              async
              src="https://telegram.org/js/telegram-widget.js?7"
              data-telegram-login="asfgasdashjashjs_bot"
              data-size="large"
              data-radius="10"
              data-request-phone="true"
            />
            <div className="space-y-4">
              <button onClick={() => router.push('/dashboard')} className="w-full rounded-md bg-blue-500 py-3 text-white transition duration-300 hover:bg-blue-600">
                Go to Dashboard
              </button>
              <button onClick={() => router.push('/orders')} className="w-full rounded-md bg-green-500 py-3 text-white transition duration-300 hover:bg-green-600">
                View Orders
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default MiniAppPage;
