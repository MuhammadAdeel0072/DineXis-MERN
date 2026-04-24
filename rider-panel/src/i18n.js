import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "dashboard": "Dashboard",
          "deliveries": "Deliveries",
          "station": "Station",
          "available_orders": "Available Orders",
          "active_mission": "Active Mission",
          "accept_delivery": "Accept Delivery",
          "start_delivery": "Start Delivery",
          "mark_as_delivered": "Mark as Delivered",
          "online": "Online",
          "offline": "Offline",
          "no_active_task": "No Active Task",
          "mission_archive": "Mission Archive",
          "completed_missions": "Completed Missions",
          "terminate_session": "Terminate Session",
          "rider_terminal": "Rider Terminal",
          "open_orders_hub": "Open Orders Hub",
          "success_rate": "Success Rate",
          "earnings": "Earnings",
          "customer": "Customer",
          "address": "Address",
          "phone": "Phone",
          "profile": "Profile",
          "online": "Online",
          "active_delivery": "Active Delivery",
          "account_details": "Account Details",
          "signin_to_continue": "Sign In to Continue",
          "login_button": "LOGIN",
          "track_orders": "Track Your Orders",
          "reject": "REJECT"
        }
      },
      ur: {
        translation: {
          "dashboard": "ڈییش بورڈ",
          "deliveries": "ڈیلیوریز",
          "station": "اسٹیشن",
          "available_orders": "دستیاب آرڈرز",
          "active_mission": "فعال مشن",
          "accept_delivery": "آرڈر قبول کریں",
          "start_delivery": "ڈیلیوری شروع کریں",
          "mark_as_delivered": "ڈیلیور شدہ نشان زد کریں",
          "online": "آن لائن",
          "offline": "آف لائن",
          "no_active_task": "کوئی فعال کام نہیں",
          "mission_archive": "مشن آرکائیو",
          "completed_missions": "مکمل شدہ مشنز",
          "terminate_session": "سیشن ختم کریں",
          "rider_terminal": "رائڈر ٹرمینل",
          "open_orders_hub": "اوپن آرڈرز ہب",
          "success_rate": "کامیابی کی شرح",
          "earnings": "آمدنی",
          "customer": "گاہک",
          "address": "پتہ",
          "phone": "فون",
          "profile": "پروفائل",
          "online": "آن لائن",
          "active_delivery": "فعال ڈیلیوری",
          "account_details": "اکاؤنٹ کی تفصیلات",
          "signin_to_continue": "جاری رکھنے کے لیے سائن ان کریں",
          "login_button": "لاگ ان کریں",
          "track_orders": "اپنے آرڈرز ٹریک کریں",
          "reject": "مسترد کریں"
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
