import { Button } from '@/components/ui/button';
import * as m from '@/paraglide/messages';
import { handleSignIn } from '@/server/auth/sign-in';

export function SignInButton() {
  return (
    <form action={handleSignIn}>
      <Button type="submit">{m.sign_in()}</Button>
    </form>
  );
}
