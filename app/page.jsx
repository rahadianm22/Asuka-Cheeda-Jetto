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
import Vettalk from '@/components/Vettalk';
import Footer from '@/components/Footer';
import PawBurst from '@/components/PawBurst';
import PawCursor from '@/components/PawCursor';
import BackToTop from '@/components/BackToTop';
import { getLiveChannelStats, getChannelVideos } from '@/lib/youtube';

export default async function Home() {
  const [liveStats, videos] = await Promise.all([getLiveChannelStats(), getChannelVideos()]);
  // An empty API result falls back to the hand-kept lists in lib/data.js.
  const covers = videos?.covers?.length ? videos.covers : undefined;
  const vettalks = videos?.vettalks?.length ? videos.vettalks : undefined;

  return (
    <>
      <div className="pawlayer" aria-hidden="true" />
      <PawBurst />
      <PawCursor />
      <TopBar />
      <Hero />
      <Ticker />
      <div className="wrap">
        <main>
          <Masthead />
          <CharacterIntro />
          <Preferences />
          <ChannelStats liveStats={liveStats} />
          <Feed covers={covers} />
          <Vettalk episodes={vettalks} />
          <SupportLinks />
          <SocialLinks />
        </main>
        <Footer />
      </div>
      <BackToTop />
    </>
  );
}
