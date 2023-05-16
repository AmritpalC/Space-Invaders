// ! ---- state variables & elements ----*/
const grid = document.querySelector('.grid')
const width = 15
const height = 12
const cellCount = width * height
let cells = []

const heroStartingPosition = 172
let heroCurrentPosition = heroStartingPosition
let allShields = [137, 138, 140, 141, 143, 144, 146, 147]

let alienPositions = [5, 6, 7, 8, 9, 10, 19, 20, 21, 22, 23, 24, 25, 26, 35, 36, 37, 38, 39, 40]
let alienMoveInterval 
let alienDirection = 'right'

const landingPage = document.getElementById("landing-page")
const gamePage = document.getElementById("game-page")
gamePage.style.visibility = 'hidden'

// ! Buttons - play, restart and mute
const playBtn = document.getElementById("play-btn")
const restartBtn = document.getElementById("restart-btn")
const musicBtn = document.getElementById("music-btn")

// ! Music and sounds for missiles and hits and win
function toggleBgMusic() {
    const bgMusic = document.getElementById('bgMusic')
    bgMusic.volume = 0.9
    bgMusic.paused ? bgMusic.play() : bgMusic.pause()
}

const heroMissileSound = document.getElementById("heroMissileSound")
heroMissileSound.playbackRate = 4
heroMissileSound.volume = 0.5
const alienMissileSound = document.getElementById("alienMissileSound")
alienMissileSound.volume = 0.3
const heroHitSound = document.getElementById("heroHitSound")
heroHitSound.playbackRate = 1.2
heroHitSound.volume = 0.7
const alienHitSound = document.getElementById("alienHitSound")
alienHitSound.playbackRate = 3
const shieldHitSound = document.getElementById("shieldHitSound")
shieldHitSound.volume = 0.6
const playerWinsSound = document.getElementById("playerWinsSound")
playerWinsSound.volume = 0.7
const gameOverSound = document.getElementById("gameOverSound")

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

musicBtn.addEventListener('click', toggleBgMusic)
restartBtn.addEventListener('click', function() {
    location.reload()
})
// restartBtn.addEventListener('click', restart)

document.addEventListener('keydown', handleHeroMovememnt)
document.addEventListener('keydown', shootHeroMissile)

// ! ---- functions ----*/
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
    startAlienMovement()
    startAlienMissile()
}

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

function addShields() {
    allShields.forEach(shield => {
        cells[shield].classList.add('shield')
    })
}

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
        gameOver()
        return
    }
    removeAliens()
    alienPositions = alienPositions.map(alien => alien + (alienDirection === "left" ? -1 : 1))
    addAliens()
}

function shootHeroMissile(event) {
    if (event.keyCode === 32) {
        event.preventDefault()
        heroMissileSound.play()
        const heroMissile = document.createElement('div')
        let heroMissilePosition = heroCurrentPosition - width
        cells[heroMissilePosition].classList.add('heroMissile')

        const heroMissileInterval = setInterval(() => {
            cells[heroMissilePosition].classList.remove('heroMissile')
            heroMissilePosition -= width

            if (heroMissilePosition < 0) {
                clearInterval(heroMissileInterval)
            } else if (cells[heroMissilePosition].classList.contains('alien')) {
                clearInterval(heroMissileInterval)
                cells[heroMissilePosition].classList.remove('alien', 'heroMissile')
                alienPositions.splice(alienPositions.indexOf(heroMissilePosition), 1)
                score += 10
                alienHitSound.play()
                playerScore.textContent = `Score: ${score}`
                playerWin()
            } else if (cells[heroMissilePosition].classList.contains('shield')) {
                clearInterval(heroMissileInterval)
                cells[heroMissilePosition].classList.remove('shield', 'heroMissile')
                allShields.splice(allShields.indexOf(heroMissilePosition), 1)
                shieldHitSound.play()
            } else {
                cells[heroMissilePosition].classList.add('heroMissile')
            }
        }, 10)
    }
}

function startAlienMissile() {
    alienMissileFrequency = setInterval(shootAlienMissile, 3000);
}  
  
function stopAlienMissile() {
    clearInterval(alienMissileFrequency)
}

function shootAlienMissile() {
    if (alienPositions.length === 0) {
        stopAlienMissile()
        return
    }

    const lastAlien = alienPositions.slice(-1)
    const startOfBottowRowAliens = Math.floor(lastAlien / width) * width
    const bottomRowAliens = []

    for (let i = startOfBottowRowAliens; i <= lastAlien; i++) {
        if (cells[i].classList.contains('alien')) {
            bottomRowAliens.push(i)
        }
    }

    const rndIdxOfBottomRowAliens = Math.floor(Math.random() * bottomRowAliens.length)
    const rndAlienSelected = bottomRowAliens[rndIdxOfBottomRowAliens]

    const alienMissile = document.createElement('div')
    let alienMissilePosition = rndAlienSelected + width
    cells[alienMissilePosition].classList.add('alienMissile')
    alienMissileSound.play()

    const alienMissileInterval = setInterval(() => {
        cells[alienMissilePosition].classList.remove('alienMissile')
        alienMissilePosition += width

        if (alienMissilePosition > cellCount) {
            clearInterval(alienMissileInterval)
        } else if (cells[alienMissilePosition].classList.contains('hero')) {
            heroHitSound.play()
            removeHero
            clearInterval(alienMissileInterval)
            lives--
            playerLives.textContent = `Lives: ${lives}`
            addHero
            gameOver()
        } else if (cells[alienMissilePosition].classList.contains('shield')) {
            cells[alienMissilePosition].classList.remove('shield', 'alienMissile')
            allShields.splice(allShields.indexOf(alienMissilePosition), 1)
            shieldHitSound.play()
            clearInterval(alienMissileInterval)
        } else {
            cells[alienMissilePosition].classList.add('alienMissile')
        }
    }, 500)
}

// ! ---- winning functions ----*/
function playerWin() {
    if (alienPositions.length === 0) {
        stopAlienMovement()
        stopAlienMissile()
        const playerWinMessage = document.getElementById('player-win')
        playerWinMessage.textContent = `Kamehamehahahaha! You have stopped Frieza and his army of clones! Your score is ${score}!`
        gamePage.style.display = 'none'
        landingPage.style.display = 'block'
        document.getElementById('welcome').style.display = 'none'
        playerWinsSound.play()
    } else {
        return
    }
}

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
        gameOverSound.play()
    } else {
        return
    }
}
// ! Restart game not working

// function restart() {
//     createGrid()
//     startGame()

    // lives = 3
    // level = 1
    // score = 0
    // heroCurrentPosition = heroStartingPosition  
    // alienPositions = [5, 6, 7, 8, 9, 10, 19, 20, 21, 22, 23, 24, 25, 26, 35, 36, 37, 38, 39, 40]
    // allShields = [137, 138, 140, 141, 143, 144, 146, 147]

    // playerLives.textContent = `Lives: ${lives}`;
    // gameLevel.textContent = `Level: ${level}`;
    // playerScore.textContent = `Score: ${score}`

    // // heroMissilePosition = null
    // // alienMissilePosition = null
    // // stopAlienMovement()
    // // stopAlienMissile()
    // // createGrid()
    // // startGame()
    
    // document.getElementById('game-over').style.display = 'none'
    // document.getElementById('player-win').style.display = 'none'
    // landingPage.style.display = 'none'
    // gamePage.style.visibility = 'visible'
    
    // // from startGame()
    // addHero(heroStartingPosition)
    // addAliens(alienPositions)
    // addShields(allShields)
    // alienDirection = 'right'
    // startAlienMovement()
    // startAlienMissile()
// }

// ! ---- Page load (initialise game) ----*/
createGrid()