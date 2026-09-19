import { useEffect, useRef } from 'react';

export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return undefined;

    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) onCredential(response.credential);
        }
      });
      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with'
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return undefined;
    }

    const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    script?.addEventListener('load', renderButton, { once: true });
    return () => script?.removeEventListener('load', renderButton);
  }, [clientId, onCredential]);

  if (!clientId) return <p className="login-error" role="alert">Google Authentication n’est pas configuré.</p>;

  return <div ref={buttonRef} aria-disabled={disabled} className="google-sign-in-button" />;
}
