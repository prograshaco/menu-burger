import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import WordSlider from '../components/WordSlider'
import ReviewsSection from '../components/ReviewsSection'
import ImageCarousel from '../components/ImageCarousel'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <WordSlider />
      <ReviewsSection />
      <ImageCarousel />
      <Footer />
    </div>
  );
};

export default LandingPage;