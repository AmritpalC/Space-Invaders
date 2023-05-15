// ! ---- state variables & elements ----*/
// Grid configuration - with width, height and cell count
const grid = document.querySelector('.grid')

// Configuring the cells on the grid
const width = 15
const height = 12
const cellCount = width * height
let cells = []

// Positions for hero, aliens and shields
const heroStartingPosition = 172
let heroCurrentPosition = heroStartingPosition
// heroCurrentPosition = heroStartingPosition //! do it this way for restart button?
let alienPositions = [5, 6, 7, 8, 9, 10, 19, 20, 21, 22, 23, 24, 25, 26, 35, 36, 37, 38, 39, 40]
const allShields = [137, 138, 140, 141, 143, 144, 146, 147]

// ! Buttons - play, restart and mute
const playBtn = document.getElementById("play-btn")
const restartBtn = document.getElementById("restart-btn")
const landingPage = document.getElementById("landing-page")
const gamePage = document.getElementById("game-page")
gamePage.style.visibility = 'hidden'

// ! Music and sounds for missiles and hits and win
function toggleBgMusic() {
    const bgMusic = document.getElementById('bgMusic')
    bgMusic.paused ? bgMusic.play() : bgMusic.pause()
}

// !HUD - lives and score
let lives = 3
const playerLives = document.getElementById('lives')

let level = 1
const gameLevel = document.getElementById('level')

let score = 0
const playerScore = document.getElementById('score')

// ! ---- event listeners ----*/
playBtn.addEventListener('click', () => {
    landingPage.style.display = 'none'
    gamePage.style.visibility = 'visible'
    startGame()
})

// restartBtn.addEventListener('click', () => {
//     landingPage.style.display = 'block'
//     gamePage.style.visibility = 'hidden'
//     gameOver()
//     startGame()
// })

const musicBtn = document.getElementById('music-btn')
musicBtn.addEventListener('click', toggleBgMusic)

// restartBtn.addEventListener('click', restart())

document.addEventListener('keydown', handleHeroMovememnt)
document.addEventListener('keydown', shootHeroMissile)

// ! ---- functions ----*/
// ? Change from landing page to game
// When start game is pressed, want the game page (section in our HTML) to change from
// being hidden to being displayed and the landing 'screen' div to be hidden. Need a 
// toggle screen function which will do this and display the HUD also

// Create Grid Cells - by iterating over our cellCount and creating divs

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
    startAlienMovement()
    startAlienMissile()
}

// Hero movement - hero classes
function addHero(position) {
    cells[position].classList.add('hero')
}

function removeHero() {
    cells[heroCurrentPosition].classList.remove('hero')
}

function handleHeroMovememnt(event){
    removeHero()
    if (event.key === 'ArrowLeft' && heroCurrentPosition > cellCount - width) {
        heroCurrentPosition--
    } else if (event.key === 'ArrowRight' && heroCurrentPosition < cellCount - 1) {
        heroCurrentPosition++
    } else if (event.key !== ' ' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault()
    }
    addHero(heroCurrentPosition)
}

// Alien being added/removed to grid
function addAliens() {
    alienPositions.forEach(alien => {
        cells[alien].classList.add('alien')
    })
}

function removeAliens() {
    alienPositions.forEach(alien => {
        cells[alien].classList.remove('alien')
    })
}

// Adding shields
function addShields() {
    allShields.forEach(shield => {
        cells[shield].classList.add('shield')
    })
}

// Alien Movement    
let alienMoveInterval 
let alienDirection = 'right'
    
function startAlienMovement() {
    alienMoveInterval = setInterval(moveAliens, 250);
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
        gameOver()
        return
    }
    playerWin()
    removeAliens()
    alienPositions = alienPositions.map(alien => alien + (alienDirection === "left" ? -1 : 1))
    addAliens()
}
 
// Handle player shooting Missile - check if missile hits alien, shield or goes off grid
// ! blur - on the el . Remember to blur the space button press (evt.target)

function shootHeroMissile(event) {
    if (event.keyCode === 32) {
        event.preventDefault()
        const heroMissile = document.createElement('div')
        let heroMissilePosition = heroCurrentPosition - width
        cells[heroMissilePosition].classList.add('heroMissile')
        console.log('Kamehameha!')

        // getting missile to move up the column (-width) on an interval once it's fired
        const heroMissileInterval = setInterval(() => {
            cells[heroMissilePosition].classList.remove('heroMissile')
            heroMissilePosition -= width

            // check if missile has reached the top of the screen
            if (heroMissilePosition < 0) {
                clearInterval(heroMissileInterval)
            // check if missile has 'hit' an alien - updating score and checking for win if so
            } else if (cells[heroMissilePosition].classList.contains('alien')) {
                clearInterval(heroMissileInterval)
                cells[heroMissilePosition].classList.remove('alien', 'heroMissile')
                alienPositions.splice(alienPositions.indexOf(heroMissilePosition), 1)
                score += 10
                playerScore.textContent = `Score: ${score}`
                playerWin()
            // check if missile has 'hit' a shield
            } else if (cells[heroMissilePosition].classList.contains('shield')) {
                clearInterval(heroMissileInterval)
                cells[heroMissilePosition].classList.remove('shield', 'heroMissile')
                allShields.splice(allShields.indexOf(heroMissilePosition), 1)
                // update hero missile up the column if not
            } else {
                cells[heroMissilePosition].classList.add('heroMissile')
            }
        }, 20)
    }
}

// Alien shooting - frequency and velocity of missiles. Also checking if alien missile hits player/shield or goes off grid
function startAlienMissile() {
    alienMissileFrequency = setInterval(shootAlienMissile, 3000);
}  
  
function stopAlienMissile() {
    clearInterval(alienMissileFrequency)
}

function shootAlienMissile() {
    // finding last available alien
    const lastAlien = alienPositions.slice(-1)
    // to find the start of the last row
    const startOfBottowRowAliens = Math.floor(lastAlien / width) * width
    const bottomRowAliens = []

    for (let i = startOfBottowRowAliens; i <= lastAlien; i++) {
        if (cells[i].classList.contains('alien')) {
            bottomRowAliens.push(i)
        }
    }
    // if no aliens left, player wins & stopAlienMissile
    if (bottomRowAliens.length === 0) {
        stopAlienMissile()
        playerWin()
        return
    }
    // selecting one of the bottom row aliens
    const rndIdxOfBottomRowAliens = Math.floor(Math.random() * bottomRowAliens.length)
    const rndAlienSelected = bottomRowAliens[rndIdxOfBottomRowAliens]

    // let rndAlienSelected
    // if (bottomRowAliens.length === 1) {
    //     rndAlienSelected = bottomRowAliens[0]
    // } else {
    //     const rndIdxOfBottomRowAliens = Math.floor(Math.random() * bottomRowAliens.length)
    //     rndAlienSelected = bottomRowAliens[rndIdxOfBottomRowAliens]
    // }

    // applying the alien missile image
    const alienMissile = document.createElement('div')
    let alienMissilePosition = rndAlienSelected + width
    cells[alienMissilePosition].classList.add('alienMissile')

    // getting missile to move down once it's fired // error on 234 and 240 when one left
    const alienMissileInterval = setInterval(() => {
        // if (alienPositions.length === 1 && !cells[alienMissilePosition].classList.contains('alien')) {
        //     clearInterval(alienMissileInterval);
        //     return;
        // }
        // cells[alienMissilePosition].classList.remove('alienMissile')
        // alienMissilePosition += width

        cells[alienMissilePosition].classList.remove('alienMissile')
        alienMissilePosition += width

        // check if missile has reached the bottom of the screen & setting missile 'speed'
        if (alienMissilePosition > cellCount) {
            clearInterval(alienMissileInterval)
        } else if (cells[alienMissilePosition].classList.contains('hero')) {
            removeHero
            clearInterval(alienMissileInterval)
            lives--
            playerLives.textContent = `Lives: ${lives}`
            addHero
            gameOver()
        } else if (cells[alienMissilePosition].classList.contains('shield')) {
            cells[alienMissilePosition].classList.remove('shield', 'alienMissile')
            allShields.splice(allShields.indexOf(alienMissilePosition), 1)
            clearInterval(alienMissileInterval)
        } else {
            cells[alienMissilePosition].classList.add('alienMissile')
        }
    }, 500)

    // if (alienPositions.length === 1 && alienMissilePosition > cellCount) {
    //     clearInterval(alienMissileInterval)
    // }
}

// ! ---- winning functions ----*/
// Player Wins
function playerWin() {
    if (alienPositions.length === 0) {
        stopAlienMovement()
        stopAlienMissile()
        const playerWinMessage = document.getElementById('player-win')
        playerWinMessage.textContent = `Kamehamehahahaha! You have stopped Frieza and his army of clones! Your score is ${score}!`
        gamePage.style.display = 'none'
        landingPage.style.display = 'block'
        document.getElementById('welcome').style.display = 'none'
        // console.log('You win! The aliens were defeated!')
    } else {
        return
    }
}

// Player loses - either: no lives lift --> so lives equal to 0 or aliens reach 'earth', (same row as the player)

function gameOver() {
    let aliensReachedEarth = (alienPositions.some((alien) => (alien >= cellCount - width)))
    if ((aliensReachedEarth) || lives === 0) {
        stopAlienMovement()
        stopAlienMissile()
        removeHero()
        document.removeEventListener('keydown', shootHeroMissile)
        
        const gameOverMessage = document.getElementById('game-over')
        gameOverMessage.textContent = (aliensReachedEarth) ? `Game over! The aliens have invaded Earth! Your final score is ${score}!` : `Game over! You ran out of lives! Your final score is ${score}!`
        gamePage.style.display = 'none'
        landingPage.style.display = 'block'
        document.getElementById('welcome').style.display = 'none'
        document.getElementById('play-btn').style.display = 'none'
    } else {
    return
    }
}

function restart() {
    gameOver()
    removeHero()
    lives = 3
    level = 1
    score = 0
    const heroStartingPosition = 172
    heroCurrentPosition = heroStartingPosition  
    alienPositions = [5, 6, 7, 8, 9, 10, 19, 20, 21, 22, 23, 24, 25, 26, 35, 36, 37, 38, 39, 40]
    allShields = [137, 138, 140, 141, 143, 144, 146, 147]
    heroMissilePosition = null
    alienMissilePosition = null
    stopAlienMovement()
    stopAlienMissile()
    createGrid()
    addHero(heroStartingPosition)
    addAliens(alienPositions)
    addShields(allShields)
    alienDirection = 'right'
    startAlienMovement()
    startAlienMissile()
    
    document.getElementById('game-over').style.display = 'none'
    document.getElementById('player-win').style.display = 'none'
    landingPage.style.display = 'none'
    gamePage.style.visibility = 'visible'
}

// addHero(heroStartingPosition)
// addAliens(alienPositions)
// addShields(allShields)
// let alienDirection = 'right'
// startAlienMovement()
// startAlienMissile()

// ! ---- Page load (initialise game) ----*/
createGrid()
// startGame()
// start game function - render the elements to the DOM
// function to toggle screen from start screen to game play?

// window.addEventListener('DOMContentLoaded', startGame)