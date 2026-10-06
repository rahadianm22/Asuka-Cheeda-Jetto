import './kamar.css';
import Room from '@/components/Kamar/Room';

export const metadata = {
  title: 'Kamar Main Jetto · Website Asuka Jetto',
  description: 'Diorama 3D ruang kerja gaming malam hari milik Jetto: geser untuk memutar, ketuk kucing, boneka, dan poster.',
};

export default function KamarPage() {
  return <Room />;
}
