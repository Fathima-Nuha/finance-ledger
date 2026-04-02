import './CategoryCard.css';
import CategoryList from "./CategoryList";

function CategoryCard({ categories, onSpend, onUpdate, onDelete, salarySet }) {
  return (
    <section className="category-card">
      <div className="category-card-header">
        <h3 className="category-card-title">Categories</h3>
        <button className="category-card-link">See Details</button>
      </div>
      <div className="category-card-list">
        <CategoryList categories={categories} onSpend={onSpend} onUpdate={onUpdate} onDelete={onDelete} salarySet={salarySet} />
      </div>
    </section>
  );
}

export default CategoryCard;