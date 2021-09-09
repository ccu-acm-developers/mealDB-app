'use strict';

const searchBox = document.getElementById('search');
const submitBtn = document.getElementById('submit');
const randomBtn = document.getElementById('random');
const resultHeading = document.getElementById('result-heading');
const mealsEl = document.getElementById('meals');
const singleMealEl = document.getElementById('single-meal');

//////////////
// FUNCTIONS

// Get JSON
const getJSON = async function (url, errorMsg = 'Something went wrong') {
  return await fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`${errorMsg} (${response.status})`);
    }
    return response.json();
  });
};

// Add multiple meals to the DOM
const displayMeals = function (mealDataArr) {
  const innerHTML = [];
  mealDataArr.forEach((mealData) => {
    const string = mealData.meals
      .map(
        (meal) => `
  <div class="meal">
    <img src="${meal.strMealThumb}" alt=${meal.strMeal}>
    <div class="meal-info" data-mealID="${meal.idMeal}"> 
      <h3>${meal.strMeal}</h3>
    </div>
  </div>
  `
      )
      .join('');
    innerHTML.push(string);
  });
  mealsEl.innerHTML = innerHTML.join('');
};

// Search meals & fetch from API
const searchMeal = async function (e) {
  e.preventDefault();
  if (searchBox.value === '') {
    alert('Please enter a search term');
    return;
  }
  const term = searchBox.value;
  const mealsArr = [];
  try {
    //Search meal by name
    const mealData = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
    );
    console.log(mealData);
    if (mealData.meals !== null) mealsArr.push(mealData);
    // Search by main ingredient
    const mealData2 = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${term}`
    );
    if (mealData2.meals !== null) mealsArr.push(mealData2);
    // Filter by category
    const mealData3 = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${term}`
    );
    console.log(mealData3);
    if (mealData3.meals !== null) mealsArr.push(mealData3);
    // Filter by area
    const mealData4 = await getJSON(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${term}`
    );
    if (mealData4.meals !== null) mealsArr.push(mealData4);

    //Create heading for result
    resultHeading.innerHTML = `<h2> Search results for '${term}':</h2>`;
    if (mealsArr.length === 0) {
      //If no results
      resultHeading.innerHTML = `<p> No search results for '${term}'. Please try again!</p>`;
      mealsEl.innerHTML = '';
      if (term === 'desert')
        resultHeading.innerHTML = `<p> No search results for '${term}'. Try "dessert"`;
      return;
    } else {
      // Add the meal data to the DOM
      displayMeals(mealsArr);
    }
    //Clear text area
    searchBox.value = '';
  } catch (err) {
    alert(err.message);
  }
};

// Class to work with the API format
class recipeItem {
  constructor(ingredient, quantity) {
    this.ingredient = ingredient;
    this.quantity = quantity;
  }
}

// Add the selected meal to the DOM
const addMealToDOM = function (meal) {
  //Get recipe data from the object
  const ingredients = [];
  const measurements = [];
  const recipeData = [];
  //the API has data for recipe in a goofy way
  for (let key in meal) {
    let word = key;
    if (word.includes('strIngredient') && meal[key] !== '') {
      ingredients.push(meal[key]);
    }
    if (word.includes('strMeasure') && meal[key] !== '') {
      measurements.push(meal[key]);
    }
  }
  for (let i = 0; i < ingredients.length; i++) {
    let j = new recipeItem(ingredients[i], measurements[i]);
    recipeData.push(j);
  }
  // Add meal data to the DOM
  singleMealEl.innerHTML = `
  <div class="single-meal">
    <h1>${meal.strMeal}</h1>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}"/>
    <div class="single-meal-info">
      ${meal.strCategory ? `<p>${meal.strCategory}</p>` : ''}
      ${meal.strCategory ? `<p><i>${meal.strArea}</i></p>` : ''}
    </div>
    <div class="main">
    ${meal.strYoutube ? `<h4>This Recipe Has A YouTube Video </h4>` : ''}
    ${
      meal.strYoutube
        ? `<div class="link"><a href=${meal.strYoutube}>YouTube</a></div>`
        : ''
    }
    ${meal.strInstructions
      .split(';')
      .map((item) => `<p>${item}.</p>`)
      .join('')}
    </div>
    <h2>Ingredients</h2>
    <ul>
    ${recipeData
      .map((item) => `<li>${item.ingredient}: ${item.quantity}</li>`)
      .join('')}
    </ul>
  </div>`;
  //Scroll to meal
  singleMealEl.scrollIntoView({ behavior: 'smooth' });
};

//Finds y value of given object
function findPos(singleMealEl) {
  var curtop = 0;
  if (obj.offsetParent) {
    do {
      curtop += obj.offsetTop;
    } while ((obj = obj.offsetParent));
    return [curtop];
  }
}

// Fetch meal by ID
const getMealByID = async function (mealID) {
  // API ID lookup feature
  const data = await getJSON(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`
  );
  const meal = data.meals[0];
  addMealToDOM(meal);
};

// Fetch random meal
const getRandomMeal = async function () {
  // Clear meals & heading
  mealsEl.innerHTML = '';
  resultHeading.innerHTML = '';

  const data = await getJSON(
    'https://www.themealdb.com/api/json/v1/1/random.php'
  );
  const meal = data.meals[0];
  addMealToDOM(meal);
};

// Init
const init = async function () {
  const areas = ['French', 'American', 'British', 'Italian', 'Chinese'];
  const random = Math.floor(Math.random() * 5);
  let randomCuisine = areas[random];

  //Filter meals by area
  const mealData = await getJSON(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${randomCuisine}`
  );
  resultHeading.innerHTML = `<h2> Search results for '${randomCuisine}'</h2>`;
  const meals = [mealData];
  displayMeals(meals);
  console.log(meals);
};
init();
////////////////////
// EVENT LISTENERS

// Submit Form Click
submitBtn.addEventListener('submit', searchMeal);
// Random Meal Click
randomBtn.addEventListener('click', getRandomMeal);
// Get Recipe Click
mealsEl.addEventListener('click', (e) => {
  let path = e.path || (e.composedPath && e.composedPath());
  const mealInfo = path.find((item) => {
    // console.log('ITEM', item);
    if (item.classList) {
      return item.classList.contains('meal-info');
    } else {
      false;
    }
  });
  if (mealInfo) {
    const mealID = mealInfo.getAttribute('data-mealid');
    getMealByID(mealID);
  }
});
