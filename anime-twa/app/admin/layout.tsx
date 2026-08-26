import { auth } from '@clerk/nextjs/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Obtenemos la información de la sesión actual de forma asíncrona
  const { userId, redirectToSignIn } = await auth();

  // 2. Si no hay un userId (es decir, no ha iniciado sesión), lo pateamos al Login
  if (!userId) {
    return redirectToSignIn();
  }

  // Si pasa la validación, mostramos el panel de administración
  return <>{children}</>;
}