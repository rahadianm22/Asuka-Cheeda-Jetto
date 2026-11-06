import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import GalleryHead from '@/components/Gallery/GalleryHead';
import BackToTop from '@/components/BackToTop';
import GalleryGrid from '@/components/Gallery/GalleryGrid';

export const metadata = {
  title: 'Galeri CF23 · Website Asuka Jetto',
  description: 'Foto-foto Asuka Jetto di Comic Frontier 23.',
};

export default function GalleryPage() {
  return (
    <>
      <div className="pawlayer" aria-hidden="true" />
      <TopBar />
      <div className="wrap gcf-page">
        <main>
          <GalleryHead />
          <GalleryGrid />
        </main>
        <Footer />
      </div>
      <BackToTop />
    </>
  );
}
