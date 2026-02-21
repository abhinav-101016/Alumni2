import Campaign from '@/components/Campaign';
import Hero from '../components/Hero';
import BulletinCarousel from '@/components/BulletinCarousal';
import EngagementSection from '@/components/EngagementSection';
import FeatureBanner from '@/components/FeatureBanner';
import AlumniEvents from '@/components/AlumniEvents';
import NewsSection from '@/components/NewsSection';

export default function Home() {
  return (
    <main>
      
      <Hero />
      <Campaign/>
      <BulletinCarousel/>
      <EngagementSection/>
      <FeatureBanner/>
      <AlumniEvents/>
      <NewsSection/>
      {/* Other sections like News or Events can go here */}
    </main>
  );
}