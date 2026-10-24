import React from 'react';
import Image from 'next/image';
import loginBackground from '../../../assets/animation/home-login.jpg';
import ekinoksLogo from '../../../assets/logo/logo-wide-color.svg';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

/**
 * 50/50 vertical split used by the login and verification screens.
 * Left: white panel. Right: full-bleed background image with a glass card on top.
 */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <section className="hidden md:flex md:w-1/2 flex-col bg-white p-12 lg:p-16">
        <Image src={ekinoksLogo} alt="Villa Ekinoks" priority className="h-auto w-48 lg:w-56" />
        <div className="mt-12 lg:mt-16">
          <h2 className="text-3xl font-light leading-tight tracking-tight text-brand-olive lg:text-4xl xl:text-5xl">
            Gateway to the true
            <br />
            Turkish Riviera Experience.
          </h2>
        </div>
      </section>

      <section className="relative flex w-full md:w-1/2 min-h-screen items-center justify-center overflow-hidden p-6">
        <Image
          src={loginBackground}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/30 bg-white/15 p-8 text-white shadow-2xl backdrop-blur-xl backdrop-saturate-150">
          {children}
        </div>
      </section>
    </div>
  );
}

export const glassInputClasses =
  'mt-1 border-white/30 bg-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/70 focus-visible:ring-offset-0';
