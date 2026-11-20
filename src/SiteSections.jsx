import React from 'react';

export default function SiteSections() { return (<>

    








<section className="home" id="home">

    <div className="swiper-container home-slider">

        <div className="swiper-wrapper wrapper">

            <div className="swiper-slide slide">
                <div className="content">
                    <span>our special dish</span>
                    <h3>spicy noodles</h3>
                    <p>noodles which are more tasty and more delicious</p>
                    <a href="#" className="btn">order now</a>
                </div>
                <div className="image">
                    <img src="images/home-img-1.png" alt="" />
                </div>
            </div>

            <div className="swiper-slide slide">
                <div className="content">
                    <span>our special dish</span>
                    <h3>fried chicken</h3>
                    <p>the best ever fried chicken of the city </p>
                    <a href="#" className="btn">order now</a>
                </div>
                <div className="image">
                    <img src="images/home-img-2.png" alt="" />
                </div>
            </div>

            <div className="swiper-slide slide">
                <div className="content">
                    <span>our special dish</span>
                    <h3>hot pizza</h3>
                    <p>the best ever pizza whose test is the best of the city </p>
                    <a href="#" className="btn">order now</a>
                </div>
                <div className="image">
                    <img src="images/home-img-3.png" alt="" />
                </div>
            </div>
            <div className="swiper-slide slide">
                <div className="content">
                    <span>our special dish</span>
                    <h3>fried chicken</h3>
                    <p>the best ever fried chicken of the city </p>
                    <a href="#" className="btn">order now</a>
                </div>
                <div className="image">
                    <img src="images/home-img-4.png" alt="" />
                </div>
            </div>
        </div>

        <div className="swiper-pagination"></div>

    </div>

</section>



<section className="dishes" id="dishes">

    <h3 className="sub-heading"> our dishes </h3>
    <h1 className="heading"> popular dishes </h1>

    <div className="box-container">

        <div className="box">
            <a href="#" className="fas fa-heart"></a>
            <a href="#" className="fas fa-eye"></a>
            <img src="images/dish-1.png" alt="" />
            <h3>Burger</h3>
            <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
            </div>
            <div className="dish-actions">
                <span>99/-</span>
                <a href="#" className="btn">add to cart</a>
            </div>
        </div>

        <div className="box">
            <a href="#" className="fas fa-heart"></a>
            <a href="#" className="fas fa-eye"></a>
            <img src="images/dish-2.png" alt="" />
            <h3>Chicken Nuggets</h3>
            <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
            </div>
            <div className="dish-actions">
                <span>99/-</span>
                <a href="#" className="btn">add to cart</a>
            </div>
        </div>

        <div className="box">
            <a href="#" className="fas fa-heart"></a>
            <a href="#" className="fas fa-eye"></a>
            <img src="images/dish-3.png" alt="" />
            <h3>Roasted Chicken</h3>
            <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
            </div>
            <div className="dish-actions">
                <span>299/-</span>
                <a href="#" className="btn">add to cart</a>
            </div>
        </div>

        <div className="box">
            <a href="#" className="fas fa-heart"></a>
            <a href="#" className="fas fa-eye"></a>
            <img src="images/dish-4.png" alt="" />
            <h3>Italino Pizza</h3>
            <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
            </div>
            <div className="dish-actions">
                <span>130/-</span>
                <a href="#" className="btn">add to cart</a>
            </div>
        </div>
        <div className="box">
            <a href="#" className="fas fa-heart"></a>
            <a href="#" className="fas fa-eye"></a>
            <img src="images/dish-5.png" alt="" />
            <h3>Stuffed Cookie</h3>
            <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
            </div>
            <div className="dish-actions">
                <span>99/-</span>
                <a href="#" className="btn">add to cart</a>
            </div>
        </div>

        <div className="box">
            <a href="#" className="fas fa-heart"></a>
            <a href="#" className="fas fa-eye"></a>
            <img src="images/dish-6.png" alt="" />
            <h3>Fried Chicken</h3>
            <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
            </div>
            <div className="dish-actions">
                <span>179/-</span>
                <a href="#" className="btn">add to cart</a>
            </div>
        </div>
        <div className="box">
            <a href="#" className="fas fa-heart"></a>
            <a href="#" className="fas fa-eye"></a>
            <img src="images/dish-7.png" alt="" />
            <h3>BBQ Ribs</h3>
            <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
            </div>
            <div className="dish-actions">
                <span>199/-</span>
                <a href="#" className="btn">add to cart</a>
            </div>
        </div>
        <div className="box">
            <a href="#" className="fas fa-heart"></a>
            <a href="#" className="fas fa-eye"></a>
            <img src="images/dish-8.png" alt="" />
            <h3>Garlic Breadsticks</h3>
            <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
            </div>
            <div className="dish-actions">
                <span>179/-</span>
                <a href="#" className="btn">add to cart</a>
            </div>
        </div>
       
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

        <div className="box">
            <div className="image">
                <img src="images/menu-1.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Pepperoni Pizza</h3>
                <p>Indulge in the ultimate cheesy delight of pepperoni pizza.</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">99/- </span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-2.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Hamburger</h3>
                <p>Experience the finest hamburgers in the city, crafted with unbeatable quality and flavor.</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">119/-</span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-3.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Pancake</h3>
                <p>A delicious treat with an irresistible taste that will leave you craving more.</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">199/-</span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-4.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Belgiun Waffle</h3>
                <p>The perfect blend of homely goodness and delightful flavors in every bite.</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">99/-</span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-5.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Berry Cake</h3>
                <p>A delightful burst of flavors that feels like home, crafted with love by our restaurant.</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">99/-</span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-6.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Blue Gray Cupcakes</h3>
                <p>Sweet, tasty, and irresistibly yummy treats for every occasion. </p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">299/-</span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-7.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Mixed Fruit Juice</h3>
                <p>Refreshing and flavorful, with a delightful variety for everyone to enjoy!</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">149/- </span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-8.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Acai Bowl</h3>
                <p>ake your time to savor the goodness and experience our exceptional service.</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">169/- </span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-9.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>American Hot Dogs</h3>
                <p>We proudly serve the best, refreshing, and zesty Hot Dogs  you'll ever taste! </p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">299/- </span>
                
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-10.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Turkey Roast</h3>
                <p>Best Roasted turkey chicken you will ever have</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">169/- </span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-11.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>chicken chettinad</h3>
                <p>India's best chettinad chicken in state</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">169/- </span>
            </div>
        </div>

        <div className="box">
            <div className="image">
                <img src="images/menu-12.jpg" alt="" />
                <a href="#" className="fas fa-heart"></a>
            </div>
            <div className="content">
                <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                </div>
                <h3>Air Fried chicken wings</h3>
                <p>The wings you would eat a lot</p>
                <a href="#" className="btn">add to cart</a>
                <span className="price">169/- </span>
            </div>
        </div>

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
    <h1 className="heading"> free and fast </h1>

    <form action="">

        <div className="inputBox">
            <div className="input">
                <span>your name</span>
                <input type="text" placeholder="enter your name" />
            </div>
            <div className="input">
                <span>your number</span>
                <input type="number" placeholder="enter your number" />
            </div>
        </div>
        <div className="inputBox">
            <div className="input">
                <span>your order</span>
                <input id="order-name" type="text" placeholder="enter food name" />
            </div>
            <div className="input">
                <span>additional food</span>
                <input id="order-extra" type="text" placeholder="extra with food" />
            </div>
        </div>
        <div className="inputBox">
            <div className="input">
                <span>how musch</span>
                <input id="order-quantity" type="number" placeholder="how many orders" min="1" />
            </div>
            <div className="input">
                <span>date and time</span>
                <input id="order-date" type="datetime-local" />
            </div>
        </div>
        <div className="inputBox">
            <div className="input">
                <span>your address</span>
                        <textarea name="" placeholder="enter your address" id="order-address" cols="30" rows="10"></textarea>
            </div>
            <div className="input">
                <span>your message</span>
                        <textarea name="" placeholder="enter your message" id="order-message" cols="30" rows="10"></textarea>
            </div>
        </div>

        <input type="submit" value="order now" className="btn" />

    </form>

</section>



<section className="footer">

    <div className="box-container">

        <div className="box">
            <h3>locations</h3>
            <a href="#">india</a>
            <a href="#">japan</a>
            <a href="#">russia</a>
            <a href="#">USA</a>
            <a href="#">france</a>
        </div>

        <div className="box">
            <h3>quick links</h3>
            <a href="#">home</a>
            <a href="#">dishes</a>
            <a href="#">about</a>
            <a href="#">menu</a>
            <a href="#">review</a>
            <a href="#">order</a>
        </div>

        <div className="box">
            <h3>contact info</h3>
            <a href="#">+91-9096001994</a>
            <a href="#">BittyBites.restaurant@gmail.com</a>
            <a href="#">gaurangsangle2223@gmail.com</a>
            <a href="#">Dhule, MH, india - 425401</a>
        </div>

        <div className="box">
            <h3>follow us</h3>
            <a href="https://www.facebook.com/gaurang.sangle.1/">facebook</a>
            <a href="https://www.instagram.com/sg.gourang/">instagram</a>
            <a href="https://www.linkedin.com/in/gaurangsangle/">linkedin</a>
            <a href="https://github.com/gaurangsg">GitHub</a>
        </div>

    </div>

    <div className="credit"> copyright @ 2024 by <span>Biity Bites</span> </div>

</section>



</>); }
