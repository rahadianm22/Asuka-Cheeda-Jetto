'use client';

import TopBar from '@/components/TopBar';
import Ticker from '@/components/Ticker';
import Hero from '@/components/Hero';
import SocialLinks from '@/components/SocialLinks';
import SupportLinks from '@/components/SupportLinks';
import ChannelStats from '@/components/ChannelStats';
import Masthead from '@/components/Masthead';
import CharacterIntro from '@/components/CharacterIntro';
import Preferences from '@/components/Preferences';
import Feed from '@/components/Feed';
import Reveal from '@/components/Reveal';
import { useLang } from '@/components/LanguageProvider';

function Footer() {
  const { t } = useLang();
  return (
    <Reveal as="footer">
      <div className="foot-main">
        <div className="foot-brand">
          <img src="/favicon-32.png" alt="" width={26} height={26} />
          <div>
            <strong>{t('brand')}</strong>
            <span>{t('footerTagline')}</span>
          </div>
        </div>

        <div className="foot-stamp" aria-hidden="true">
          <span className="foot-stamp-label">{t('footerRecord')}</span>
          <span className="foot-stamp-num">JT-0001</span>
          <span className="foot-stamp-status">{t('footerStatus')}</span>
        </div>
      </div>
    </Reveal>
  );
}

export default function Home() {
  return (
    <>
      <div className="pawlayer" aria-hidden="true" />
      <TopBar />
      <Ticker />
      <Hero />
      <div className="wrap">
        <Masthead />
        <CharacterIntro />
        <Preferences />
        <ChannelStats />
        <Feed />
        <SupportLinks />
        <SocialLinks />
        <Footer />
      </div>
    </>
  );
}
