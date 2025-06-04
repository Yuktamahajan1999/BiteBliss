/* eslint-disable no-unused-vars */
import React from 'react'
import Header from './Header/Header';
import Card  from './Card/Card';
import Footer from './Footer/Footer';

const Dining = () => {
  return (
    <div>
      <Header/>
      <Card filterType="dining" />
      <Footer/>
    </div>
  )
}

export default Dining
