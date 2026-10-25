import React from 'react';
import Image from 'next/image';
import loginBackground from '../../../assets/animation/home-login.jpg';
import ekinoksLogo from '../../../assets/logo/logo-wide-color.svg';
import styles from './AuthSplitLayout.module.css';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

/**
 * 50/50 vertical split used by the login and verification screens.
 * Left: white panel. Right: full-bleed background image with a glass card on top.
 */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className={styles.div}>
      <section className={styles.section}>
        <Image src={ekinoksLogo} alt="Villa Ekinoks" priority className={styles.image} />
        <div className={styles.div2}>
          <h2 className={styles.h2}>
            Gateway to the true
            <br />
            Turkish Riviera Experience.
          </h2>
        </div>
      </section>

      <section className={styles.section2}>
        <Image
          src={loginBackground}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 768px) 50vw, 100vw"
          className={styles.image2}
        />
        <div className={styles.div3} />

        <div className={styles.div4}>
          {children}
        </div>
      </section>
    </div>
  );
}

export const glassInputClasses =
  styles.glassInput;
