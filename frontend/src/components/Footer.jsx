import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I place an order?",
      answer: "Browse our collection, add items to your cart, select your preferred size, and proceed to checkout. Fill in your delivery information and choose a payment method (eSewa, Khalti, or Cash on Delivery)."
    },
    {
      id: 2,
      question: "What payment methods do you accept?",
      answer: "We accept eSewa, Khalti, and Cash on Delivery (COD). All online payments are processed securely through our payment gateway partners."
    },
    {
      id: 3,
      question: "How long does delivery take?",
      answer: "Standard delivery takes 3-5 business days within Nepal. Express delivery options are available at checkout. You can track your order status in real-time through the 'Track Order' feature."
    },
    {
      id: 4,
      question: "Can I cancel or modify my order?",
      answer: "You can cancel your order within 24 hours of placing it. For modifications, please contact our customer support team at contact.trendify@info.com or call +977 9810771153."
    },
    {
      id: 5,
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for unused items in their original packaging with tags attached. Items must be in the same condition as received. Contact us to initiate a return."
    },
    {
      id: 6,
      question: "How do I track my order?",
      answer: "Once your order is placed, you'll receive a tracking number. Visit the 'Orders' page in your account and click 'Track Order' to see real-time updates on your shipment status."
    },
    {
      id: 7,
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within Nepal. We're working on expanding our delivery services to international locations. Stay tuned for updates!"
    },
    {
      id: 8,
      question: "How can I save products for later?",
      answer: "You can add products to your favorites by clicking the heart icon on any product. Access all your saved items from the 'Favorites' page in your account."
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <footer className='mt-20 pt-12 pb-6 border-t border-gray-200'>
        <div className='flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_2fr] gap-8 lg:gap-12 mb-8'>
            {/* Company Info Section */}
            <div className='flex flex-col'>
                <Link to='/' className='mb-4'>
                    <img src={assets.logo} className='w-32 cursor-pointer' alt="Trendify" />
                </Link>
                <p className='text-gray-600 text-sm leading-relaxed max-w-md'>Thank you for shopping with Trendify! We're dedicated to bringing you the latest trends and top-quality products. Follow us on social media for updates on new arrivals, exclusive offers, and more. If you have any questions or need assistance, our friendly customer support team is here to help.</p>
            </div>

            {/* Company Links Section */}
            <div className='flex flex-col'>
                <h3 className='mb-4 text-base font-semibold text-gray-900 uppercase tracking-wide'>Company</h3>
                <ul className='flex flex-col gap-2.5'>
                    <Link to='/'>
                        <li className='text-sm text-gray-600 hover:text-purple-600 transition-colors cursor-pointer'>Home</li>
                    </Link>
                    <Link to='/about'>
                        <li className='text-sm text-gray-600 hover:text-purple-600 transition-colors cursor-pointer'>About Us</li>
                    </Link>
                    <Link to='/about'>
                        <li className='text-sm text-gray-600 hover:text-purple-600 transition-colors cursor-pointer'>Delivery</li>
                    </Link>
                    <Link to='/about'>
                        <li className='text-sm text-gray-600 hover:text-purple-600 transition-colors cursor-pointer'>Privacy & Policy</li>
                    </Link>
                </ul>
            </div>

            {/* Contact Section */}
            <div className='flex flex-col'>
                <h3 className='mb-4 text-base font-semibold text-gray-900 uppercase tracking-wide'>Get In Touch</h3>
                <ul className='flex flex-col gap-2.5'>
                    <li className='text-sm text-gray-600 flex items-center gap-2'>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                        </svg>
                        +977 9810771153
                    </li>
                    <li className='text-sm text-gray-600 flex items-center gap-2'>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                        </svg>
                        contact.trendify@info.com
                    </li>
                </ul>
            </div>

            {/* FAQ Section */}
            <div className='flex flex-col'>
                <h3 className='mb-4 text-base font-semibold text-gray-900 uppercase tracking-wide'>Frequently Asked Questions</h3>
                <div className='flex flex-col gap-1.5'>
                    {faqs.map((faq) => (
                        <div key={faq.id} className='border-b border-gray-100 last:border-b-0'>
                            <button
                                onClick={() => toggleFaq(faq.id)}
                                className='w-full text-left flex items-start justify-between text-gray-700 hover:text-purple-600 transition-colors py-2.5 gap-3 group'
                            >
                                <span className='text-sm font-medium flex-1 leading-snug'>{faq.question}</span>
                                <svg
                                    className={`w-4 h-4 transition-transform flex-shrink-0 mt-0.5 text-gray-400 group-hover:text-purple-600 ${openFaq === faq.id ? 'rotate-180' : ''}`}
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                </svg>
                            </button>
                            {openFaq === faq.id && (
                                <p className='text-gray-600 text-xs mt-1 mb-2.5 pl-0 animate-fadeIn leading-relaxed'>{faq.answer}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Copyright Section */}
        <div className='pt-6 border-t border-gray-200'>
            <p className='text-xs text-gray-500 text-center'>Copyright © 2025 Trendify. All rights reserved.</p>
        </div>
    </footer>
  )
}

export default Footer
