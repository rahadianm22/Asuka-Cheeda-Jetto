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
import Footer from '@/components/Footer';
import { getLiveChannelStats } from '@/lib/youtube';

export default async function Home() {
  const liveStats = await getLiveChannelStats();

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
        <ChannelStats liveStats={liveStats} />
        <Feed />
        <SupportLinks />
        <SocialLinks />
        <Footer />
      </div>
    </>
  );
}
