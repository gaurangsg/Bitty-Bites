import React from 'react';
import ProductCard from './components/ProductCard.jsx';
import { featuredDishes, menuDishes, popularDishes } from './data/catalog.js';

const featuredCopy = [
  'Slow-tossed noodles, bold seasoning, and a little heat in every bite.',
  'Golden, crisp on the outside, and tender all the way through.',
  'Hot from the oven with a generous layer of irresistible toppings.',
  'A fresh-from-the-kitchen favorite, made for sharing and savoring.'
];

export default function SiteSections({ favorites = [], onToggleFavorite, onAddToCart }) { return (<>

    








<section className="home" id="home">

    <div className="home-ambient home-ambient-one" aria-hidden="true"></div>
    <div className="home-ambient home-ambient-two" aria-hidden="true"></div>

    <div className="swiper-container home-slider">

        <div className="swiper-wrapper wrapper">
            {featuredDishes.map((item, index) => <div className="swiper-slide slide" key={`${item.name}-${item.image}`}>
                <div className="content">
                    <span className="home-kicker"><i className="fas fa-star"></i> made fresh, served happy</span>
                    <p className="home-eyebrow">today's kitchen favorite</p>
                    <h1>{item.name}</h1>
                    <p className="home-description">{featuredCopy[index] || 'A much-loved BittyBites favorite, made fresh for your table.'}</p>
                    <div className="home-rating"><span aria-label="Rated 4.8 out of 5">★★★★★</span><small>Guest favorite <b>·</b> freshly prepared</small></div>
                    <div className="home-hero-actions">
                        <a href="/cart" className="btn home-order-button" onClick={event => { event.preventDefault(); onAddToCart(item.name, item.price, true, item.image); }}>Order this special <i className="fas fa-arrow-right"></i></a>
                        <a href="#menu" className="home-explore-link"><span><i className="fas fa-play"></i></span> Explore the menu</a>
                    </div>
                </div>
                <div className="image home-hero-image">
                    <div className="home-image-orbit home-image-orbit-one"></div><div className="home-image-orbit home-image-orbit-two"></div>
                    <div className="home-image-stage"><img src={item.image} alt={item.name} /></div>
                    <div className="home-image-stamp"><i className="fas fa-leaf"></i><span>freshly<br />made</span></div>
                    <div className="home-price-chip"><span>today's special</span><strong>₹{Number(item.price).toFixed(0)}</strong></div>
                </div>
            </div>)}
        </div>

        <div className="swiper-pagination"></div>

    </div>

    <div className="home-discovery" aria-label="Explore BittyBites">
        <a href="#dishes"><span className="home-discovery-icon"><i className="fas fa-fire-alt"></i></span><span><strong>Fan favorites</strong><small>The dishes people come back for</small></span><i className="fas fa-arrow-up"></i></a>
        <a href="#menu"><span className="home-discovery-icon"><i className="fas fa-utensils"></i></span><span><strong>Today's menu</strong><small>Find your next delicious bite</small></span><i className="fas fa-arrow-up"></i></a>
        <a href="#review"><span className="home-discovery-icon"><i className="fas fa-heart"></i></span><span><strong>Made with care</strong><small>See what our guests are saying</small></span><i className="fas fa-arrow-up"></i></a>
    </div>

</section>



<section className="dishes" id="dishes">
    <h3 className="sub-heading"> our dishes </h3>
    <h1 className="heading"> popular dishes </h1>
    <div className="box-container">
      {popularDishes.map(item => <ProductCard key={item.name} item={item} variant="popular" favorites={favorites} onToggleFavorite={onToggleFavorite} onAddToCart={onAddToCart} />)}
    </div>
</section>



<section className="about" id="about">

    <h3 className="sub-heading"> about us </h3>
    <h1 className="heading"> why choose BittyBites ? </h1>

    <div className="row">

        <div className="image">
            <img src="images/about-img.png" alt="" />
        </div>

        <div className="content">
            <h3>best food in the City</h3>
            <p>Welcome to BittyBites, The #1 restaurant in Dhule City , Where we take pride in serving authentic and delicious dishes from various regions of India. Our menu features a wide variety of options, from classic tandoori dishes to traditional curries and biryani. We use the freshest and high-quality ingredients to make sure that each dish is a burst of flavors in your mouth. Our chefs are experts in traditional Indian cooking techniques and are passionate about creating a memorable dining experience for you. Whether you're a fan of spicy food or prefer more mild dishes, we have something for everyone.!</p>
            <p>We hope you will enjoy your visit with us!</p>
            <div className="icons-container">
                <div className="icons">
                    <i className="fas fa-shipping-fast"></i>
                    <span>Superfast delivery</span>
                </div>
                <div className="icons">
                    <i className="fas fa-dollar-sign"></i>
                    <span>Convenient Payments</span>
                </div>
                <div className="icons">
                    <i className="fas fa-headset"></i>
                    <span>24/7 service</span>
                </div>
            </div>
            <a href="#" className="btn">learn more</a>
        </div>

    </div>

</section>



<section className="menu" id="menu">
    <h3 className="sub-heading"> our menu </h3>
    <h1 className="heading"> today's speciality </h1>
    <div className="box-container">
      {menuDishes.map(item => <ProductCard key={item.name} item={item} variant="menu" favorites={favorites} onToggleFavorite={onToggleFavorite} onAddToCart={onAddToCart} />)}
    </div>
</section>



<section className="review" id="review">

    <h3 className="sub-heading"> customer's review </h3>
    <h1 className="heading"> what they say </h1>

    <div className="swiper-container review-slider">

        <div className="swiper-wrapper">

            <div className="swiper-slide slide">
                <i className="fas fa-quote-right"></i>
                <div className="user">
                    <img src="images/nikesh.png" alt="" />
                    <div className="user-info">
                        <h3>Nikesh Patil</h3>
                        <div className="stars">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star-half-alt"></i>
                        </div>
                    </div>
                </div>
                <p>This charming restaurant truly stands out!! The warm and welcoming staff😊, mouthwatering cuisine, stunning plating, and an impressive selection of wines🍷make it an unforgettable experience. The desserts are simply divine.Every bite is a delightful journey, and the service makes it all the more special 💫. A must-visit spot that I can’t wait to return to again and again! 🙌✨</p>
            </div>

            <div className="swiper-slide slide">
                <i className="fas fa-quote-right"></i>
                <div className="user">
                    <img src="images/Raj kedar.png" alt="" />
                    <div className="user-info">
                        <h3>Raj Kedar  </h3>
                        <div className="stars">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star-half-alt"></i>
                        </div>
                    </div>
                </div>
                <p>It was an exceptional experience!!😋🍽️ The ambiance is inviting and delightful✨, paired with outstanding food, wine, and service😊. The staff is incredibly knowledgeable and offers fantastic recommendations.Every dish is a masterpiece 😋, bursting with flavor and beautifully presented.I left feeling completely satisfied and can't wait to return for another unforgettable experience 😍.</p>
            </div>

            <div className="swiper-slide slide">
                <i className="fas fa-quote-right"></i>
                <div className="user">
                    <img src="images/Parth Deore.jpeg" alt="" />
                    <div className="user-info">
                        <h3>Parth Deore</h3>
                        <div className="stars">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star-half-alt"></i>
                        </div>
                    </div>
                </div>
                <p>This spot is fantastic...!!🥳The vibe is relaxed and welcoming 😊, and the staff couldn’t be friendlier. They’re knowledgeable and genuinely focused on ensuring every guest has a great time 🎉. The food is delicious, offering a mix of classic Italian flavors with creative twists✨. I like the asian especially indian cousine the most.Considering the quality and prices, it’s an absolute steal..!🎉</p>
            </div>

            <div className="swiper-slide slide">
                <i className="fas fa-quote-right"></i>
                <div className="user">
                    <img src="images/Neeraja.png" alt="" />
                    <div className="user-info">
                        <h3>Neeraja </h3>
                        <div className="stars">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star-half-alt"></i>
                        </div>
                    </div>
                </div>
                <p>The food here is absolutely exquisite..!😊 The menu is both extensive and seasonal. It truly represents the art of fine dining. While it can be a bit on the pricier side , every bite is worth it, and they offer special deals on different nights, so it’s definitely worth checking before booking😁. Highly recommend this culinary gem for a memorable dining experience! 🥳</p>
            </div>

        </div>

    </div>
    
</section>



<section className="order" id="order">

    <h3 className="sub-heading"> order now </h3>
    <h1 className="heading"> fresh food, easy checkout </h1>
    <div className="order-checkout-handoff">
        <div className="order-checkout-copy">
            <span className="order-checkout-kicker"><i className="fas fa-bag-shopping"></i> YOUR TABLE, YOUR CHOICE</span>
            <h2>Build your order first</h2>
            <p>Add dishes from our menu, then enter your delivery and contact details together in your cart checkout.</p>
            <div className="order-checkout-actions">
                <a href="/cart" className="btn">Go to cart <i className="fas fa-arrow-right"></i></a>
                <a href="#menu" className="order-menu-link">Explore today’s menu</a>
            </div>
        </div>
        <div className="order-checkout-steps" aria-label="How checkout works">
            <div><span>01</span><i className="fas fa-utensils"></i><strong>Choose dishes</strong><small>Pick favorites from the menu</small></div>
            <div><span>02</span><i className="fas fa-clipboard-list"></i><strong>Review your cart</strong><small>Adjust items and quantities</small></div>
            <div><span>03</span><i className="fas fa-truck"></i><strong>Share delivery details</strong><small>One simple checkout form</small></div>
        </div>
    </div>

</section>



<section className="footer">

    <div className="box-container">
        <div className="box">
            <h3>quick links</h3>
            <div className="footer-quick-links">
                <a href="#home">home</a>
                <a href="#dishes">dishes</a>
                <a href="#about">about</a>
                <a href="#menu">menu</a>
                <a href="#review">reviews</a>
                <a href="#order">order</a>
            </div>
        </div>

        <div className="box">
            <h3>restaurant contact</h3>
            <a href="mailto:BittyBites.restaurant@gmail.com"><i className="fas fa-envelope"></i> BittyBites.restaurant@gmail.com</a>
            <a href="https://maps.google.com/?q=Dhule%2C+Maharashtra+425401" target="_blank" rel="noreferrer"><i className="fas fa-map-marker-alt"></i> Dhule, Maharashtra - 425401</a>
            <a href="/admin/login"><i className="fas fa-lock"></i> Restaurant admin</a>
        </div>

        <div className="box">
            <h3>website by</h3>
            <p className="footer-builder-name">Gaurang Sangle</p>
            <a href="tel:+919096001994"><i className="fas fa-phone"></i> +91-9096001994</a>
            <a href="mailto:gaurangsangle2523@gmail.com"><i className="fas fa-envelope"></i> gaurangsangle2523@gmail.com</a>
            <a href="https://www.instagram.com/sg.gourang/" target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i> Instagram</a>
        </div>

    </div>

    <div className="credit"> copyright @ 2024 by <span>Biity Bites</span> </div>

</section>



</>); }
