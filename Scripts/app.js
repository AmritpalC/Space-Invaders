// ! ---- state variables & elements ----*/
// ? Grid configuration - with width, height and cell count
// set width and height constants and create a cell count 
// and create an array for the cells

// Creating a grid
const grid = document.querySelector('.grid')

// configuring the cells on the grid
const width = 15
const height = 12
const cellCount = width * height
let cells = []

const heroStartingPosition = 172
let heroCurrentPosition = heroStartingPosition

// ? Alien configuration - an array for the alive aliens at the start of the game - nested arrays/sep

let alienPositions = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]

// ? Shields - need arrays for the locations of the 4 shields

const allShields = [
    [152, 153],
    [155, 156],
    [158, 159],
    [161, 162]
]

// ? Buttons - play, restart and mute
// ? Music and sounds for missiles and hits and win
// ? HUD - lives and score

// ! ---- event listeners ----*/
// will need an event listener for handling a player directional
//move - so left (-= 1) or right (+= 1) along the x axis
document.addEventListener('keydown', handleHeroMovememnt)
document.addEventListener('keydown', shootHeroMissile)


// will also need an event listener for the space bar - to fire a missile

// ! ---- functions ----*/

// ? Change from landing page to game
// When start game is pressed, want the game page (section in our HTML) to change from
// being hidden to being displayed and the landing 'screen' div to be hidden. Need a 
// toggle screen function which will do this and display the HUD also

// ? Create Grid Cells - by iterating over our cellCount and creating divs
    // Will add the index as an attribute
    // need to add each cell (div) to the grid and push to cells array
    // Need to have user (hero) starting position - middle of bottom row

function createGrid() {
    for (let i = 0; i < cellCount; i++) {
        const cell = document.createElement('div')
        cell.innertText = i
        cell.dataset.index = i
        cell.style.height = `${100 / height}%`
        cell.style.width = `${100 / width}%`
        grid.appendChild(cell)
        cells.push(cell)
    }
}


function startGame() {
    addHero(heroStartingPosition)
    addAliens(alienPositions)
    addShields(allShields)
    let alienDirection = 'right'
    // startAlienMovement()
    gameOver()
}

// ? Hero movement - hero classes
// add the hero class by adding the class which relates to their image
// Remove the hero from their previous position so that their current position 
// can than be updated to their new cell

// ? Player class - to handle movement & shooting of missiles
// For the player, will be best to have a method using keycodes for left and right
// Will need guards in place for the left and right movement so that the player 
// stays on the board when moving (updating current position)
// Imagine we can have another method for the player firing their missiles

function addHero(position) {
    console.log('Hero added to the following cell ->', position)
    cells[position].classList.add('hero')
}

function removeHero() {
    console.log('Hero removed')
    cells[heroCurrentPosition].classList.remove('hero')
}

function handleHeroMovememnt(event){
    const key = event.keyCode
    
    const left = 37
    const right = 39
    
    removeHero()
    
    if (key === left && heroCurrentPosition > cellCount - width) {
        console.log('LEFT')
        heroCurrentPosition--
    } else if (key === right && heroCurrentPosition < cellCount - 1) {
        console.log('RIGHT')
        heroCurrentPosition++
    } else {
        console.log('INVALID KEY')
    }
    
    addHero(heroCurrentPosition)
}

// ? Alien classes
// add the alien classes which relates to their respective images
// Remove the class from their previous positions so that their current position 
// can than be updated to their new cell

function addAliens() {
    alienPositions.forEach(alien => {
        console.log('Enemy added to the following cell ->', alien)
        cells[alien].classList.add('alien')
    })
}

function removeAliens() {
    alienPositions.forEach(alien => {
        console.log('Enemy removed')
        cells[alien].classList.remove('alien')
    })
}

// ? Adding shields

function addShields() {
    allShields.forEach(shields => {
        console.log('Shield added to the following cell ->', shields)
        shields.forEach(shield => {
            cells[shield].classList.add('shield')
        })
    })
}


// ? Alien Movement
// Need to have the aliens (array) start off by moving from left to right. (+= 1)
// Then when the furthest right alien value hits the 'wall' to the right, increase 
// the index of the aliens array by width (so they move down a row)
// Repeat functionality going left -= 1
// Then when leftmost alien hits the wall, again increase the index by width
// some method! Iterate over array using some and if one alien does have a remainder
// of 0 when divided by (width - 1) - should move them down, else move right
// Use an interval timer to start alien movement


// function aliensMovement() {
    //     moveAliensRight()
    //     moveAliensLeft()
    // }
    
let alienMoveInterval 
let alienDirection = 'right'
    
function startAlienMovement() {
    alienMoveInterval = setInterval(moveAliens, 1000);
}  
  
function stopAlienMovement() {
    clearInterval(alienMoveInterval)
}

function moveAliens() {
    const aliensReachedWall = alienPositions.some(alien => 
        (alien % width === 0 && alienDirection === "left") || 
        ((alien + 1) % width === 0 && alienDirection === "right"))

    if (aliensReachedWall) {
        removeAliens()
        alienPositions = alienPositions.map(alien => alien + width)
        alienDirection = alienDirection === "left" ? "right" : "left"
        addAliens()
        return
    }

    removeAliens()
    alienPositions = alienPositions.map(alien => alien + (alienDirection === "left" ? -1 : 1))
    addAliens()
}
 



// ? Handle shoot - will need separate functions for player and aliens
// ? Player Shoot
// only allow missile fire (space press) to be valid if there is not a cell with 
// class of missile already. Update position of missile up the y axis of the column 
// of where the missile exists. Class will update as this happens, until the missile 
// goes 'off screen'

// ! blur - on the el . Remember to blur the space button press (evt.target)


function shootHeroMissile(event) {
    if (event.keyCode === 32) {
        const heroMissile = document.createElement('div')
        let heroMissilePosition = heroCurrentPosition - width
        cells[heroMissilePosition].classList.add('heroMissile')
        // const heroMissileCell = document.querySelector(`[data-cell='${heroMissilePosition}']`)
        // heroMissileCell.appendChild(heroMissile)
        console.log('Kamehameha!')
    }
}

    // const key = event.keyCode
    
    // const space = 32
    // const right = 39
    
    // removeHero()
    
    // if (key === left && heroCurrentPosition > cellCount - width) {
    //     console.log('LEFT')
    //     heroCurrentPosition--
    // } else if (key === right && heroCurrentPosition < cellCount - 1) {
    //     console.log('RIGHT')
    //     heroCurrentPosition++
    // } else {
    //     console.log('INVALID KEY')
    // }
    
    // addHero(heroCurrentPosition)
// }

// ? Alien shoot
// Will need a bottom row alien to be randomly selected to fire a missile at the user. 
// Limit how frequently this occurs, use an interval?
// Select the lowest row aliens and create a new array and randomly select
// an alien from the list? Might be a cleaner way.
// Update class of cell of the missile as it moves down the column, until the
// missile goes off screen

// ? Check if an alien has been hit
// Where the classes of players missile and alien position are the same, that 
// would be a hit. 
// Or, need to look into collision detection but based on brief research so 
// far, use the rectangle hit boxes and if they overlap it's a hit?
// Update score as each alien is hit

// ? Check if player has been hit
// Similar to above, use collision or where the class of alien missile and
// player position have the same index, lose a life

// ! ---- winning functions ----*/
// ? Player Wins
// When there are no aliens left - so no aliens in the aliens array?

// ? Player loses 
// No lives lift --> so lives equal to 0
// Aliens reach 'earth' so reach the same row as the player

function gameOver() {
    let aliensReachedEarth = (alienPositions.some((alien) => (alien >= cellCount - width)))
    // or try if alien === cellCount - 1  --> i.e when the aliens reach cell 179 (bottom right)
    if (aliensReachedEarth) {
        stopAlienMovement()
        console.log('Game over! The aliens have invaded Earth!')
    } else {
        return
    }
}



// ! ---- Page load (initialise game) ----*/
createGrid()
startGame()
// start game function - render the elements to the DOM
// function to toggle screen from start screen to game play?
