import React from 'react';

function FavoriteToggle({ item, favorites, onToggleFavorite }) {
  const selected = favorites.some(favorite => favorite.name === item.name && favorite.image === item.image);
  return <button
    type="button"
    className={`product-favorite fas fa-heart${selected ? ' is-favorite' : ''}`}
    aria-label={`${selected ? 'Remove' : 'Add'} ${item.name} ${selected ? 'from' : 'to'} favorites`}
    aria-pressed={selected}
    onClick={() => onToggleFavorite(item)}
  />;
}

function Stars() {
  return <div className="stars" aria-label="Rated 4.5 out of 5">
    {[0, 1, 2, 3].map(star => <i key={star} className="fas fa-star" aria-hidden="true"></i>)}
    <i className="fas fa-star-half-alt" aria-hidden="true"></i>
  </div>;
}

export default function ProductCard({ item, variant = 'menu', favorites, onToggleFavorite, onAddToCart }) {
  const isPopular = variant === 'popular';
  return <article className={`box product-card product-card-${variant}`}>
    {isPopular ? <FavoriteToggle item={item} favorites={favorites} onToggleFavorite={onToggleFavorite} /> : <div className="image">
      <img src={item.image} alt={item.name} loading="lazy" />
      <FavoriteToggle item={item} favorites={favorites} onToggleFavorite={onToggleFavorite} />
    </div>}
    {isPopular && <a href="#menu" className="fas fa-eye product-view-link" aria-label={`See ${item.name} in the menu`}></a>}
    {isPopular && <img src={item.image} alt={item.name} loading="lazy" />}
    {isPopular ? <>
      <h3>{item.name}</h3>
      <Stars />
      <div className="dish-actions">
        <span>{item.price}/-</span>
        <button type="button" className="btn" onClick={() => onAddToCart(item.name, item.price, false, item.image)}>Add To Cart</button>
      </div>
    </> : <div className="content">
      <Stars />
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <a href="#cart" className="btn" onClick={event => { event.preventDefault(); onAddToCart(item.name, item.price, false, item.image); }}>add to cart</a>
      <span className="price">{item.price}/-</span>
    </div>}
  </article>;
}
