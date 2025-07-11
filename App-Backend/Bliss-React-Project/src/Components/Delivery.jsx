/* eslint-disable no-unused-vars */
import React from 'react'
import Header from './Header/Header';
import { Gallery, GalleryRestaurants } from './Gallery';
import Footer from './Footer/Footer';
import Card  from './Card/Card';
import { galleryItems, restaurants } from '../Components/data';


const Delivery = () => {
  return (
    <div>
      <Header/>
      <Gallery
        itemsPerPage={6}
        data={galleryItems}
        title="Inspiration for Your First Order"
      />
      <GalleryRestaurants
        data={restaurants}
        itemsPerPage={4}
        title="Top Brands for You"
      />
      <Card filterType="delivery" />
      <Footer />

    </div>
  )
}

export default Delivery;
