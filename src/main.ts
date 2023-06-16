import { DEFAULT_SIZE, MAX_SIZE } from "./constants"
import {
  Pair,
  getShortestPath,
  getShortestPathDijkstra,
  getShortestPathAstar,
} from "./helpers"
import { make2dArray } from "./helpers"
import "./style.css"

let grid = document.getElementById("grid"),
  select = document.getElementById("mode"),
  algorithmSelectBox = document.getElementById("algorithm"),
  startBtn = document.getElementById("start")

let mode: "blocks" | "target" | "location" = "blocks",
  algorithm: "bfs" | "dijkstra" | "astar" = "bfs"

function main(size = DEFAULT_SIZE) {
  const blocks = make2dArray(size, false)
  let isSolved = false

  grid!.style.gridTemplateColumns = `repeat(${size}, 1fr)`

  let target = new Pair(size - 1, size - 1),
    location = new Pair(0, 0)

  function render() {
    grid!.innerHTML = ""
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const isLocation = location.first === i && location.second === j
        const isTarget = target.first === i && target.second === j

        grid!.innerHTML += `<button id="c-${i}-${j}" i="${i}" j="${j}" class="box ${
          blocks[i][j] ? "bg-black" : (isLocation || isTarget) ? "bg-[green]" : ""
        }">${isLocation ? "A" : isTarget ? "B" : ""}</button>`
      }
    }

    document.querySelectorAll(".box").forEach((box) => {
      box.addEventListener("click", () => {
        if (isSolved) {
          render()
          isSolved = false
        }

        const i = +box.getAttribute("i")!,
          j = +box.getAttribute("j")!

        // preventing collision with target and location positions
        if (
          mode === "blocks" &&
          (location.first !== i || location.second !== j) &&
          (target.first !== i || target.second !== j)
        ) {
          blocks[i][j] = !blocks[i][j]
          document.getElementById(`c-${i}-${j}`)!.style.backgroundColor =
            blocks[i][j] ? "black" : "white"
        }

        // preventing collision with blocks and target positions
        if (
          mode === "location" &&
          !blocks[i][j] &&
          (target.first !== i || target.second !== j)
        ) {
          document.getElementById(`c-${location.first}-${location.second}`)!.style.backgroundColor = "white"
          document.getElementById(`c-${location.first}-${location.second}`)!.innerText = ""
          location.first = i
          location.second = j
          document.getElementById(`c-${location.first}-${location.second}`)!.style.backgroundColor = "green"
          document.getElementById(`c-${location.first}-${location.second}`)!.innerText = "A"
        }

        // preventing collision with blocks and location positions
        if (
          mode === "target" &&
          !blocks[i][j] &&
          (location.first !== i || location.second !== j)
        ) {
          document.getElementById(`c-${target.first}-${target.second}`)!.style.backgroundColor = "white"
          document.getElementById(`c-${target.first}-${target.second}`)!.innerText = ""
          target.first = i
          target.second = j
          document.getElementById(`c-${target.first}-${target.second}`)!.style.backgroundColor = "green"
          document.getElementById(`c-${target.first}-${target.second}`)!.innerText = "B"
        }
      })
    })
  }

  select!.addEventListener("change", () => {
    mode = (<HTMLSelectElement>document.getElementById("mode")).value as
      | "blocks"
      | "target"
      | "location"
  })

  algorithmSelectBox!.addEventListener("change", () => {
    algorithm = (<HTMLSelectElement>algorithmSelectBox).value as
      | "bfs"
      | "dijkstra"
      | "astar"

    // show the a* options and remove them if not selected
    if (algorithm === "astar") {
      document.querySelector("#heuristic")!.classList.remove("hidden")
      document.querySelector("#heuristic-label")!.classList.remove("hidden")
    } else {
      document.querySelector("#heuristic")!.classList.add("hidden")
      document.querySelector("#heuristic-label")!.classList.add("hidden")
    }
  })

  startBtn?.addEventListener("click", async () => {
    isSolved = true
    render()

    const selectedAlgorithm =
      algorithm === "bfs"
        ? getShortestPath
        : algorithm === "dijkstra"
        ? getShortestPathDijkstra
        : getShortestPathAstar

    const sol = await selectedAlgorithm(
      new Pair(location.first, location.second),
      new Pair(target.first, target.second),
      blocks,
      size
    )

    if (sol)
      sol.forEach(async (pair) => {
        // preventing location and target from getting colored red
        if (
          (pair.first != target.first || pair.second != target.second) &&
          (pair.first != location.first || pair.second != location.second)
        )
          document.getElementById(
            `c-${pair.first}-${pair.second}`
          )!.style.backgroundColor = "red"
      })
    else alert("No solutions found")
  })

  render()
}

main(DEFAULT_SIZE)

function syncSizeForm() {
  const input = <HTMLInputElement>document.getElementById("size")
  input.value = DEFAULT_SIZE.toString()
  input.max = MAX_SIZE.toString()

  document.getElementById("form")?.addEventListener("submit", (e) => {
    e.preventDefault()
    const sizeInput = (<HTMLInputElement>document.getElementById("size")).value

    // recreate the button to remove event listeners
    let newBtn = startBtn!.cloneNode(true)
    startBtn!.parentNode!.replaceChild(newBtn, startBtn!)
    startBtn = newBtn as HTMLElement

    main(+sizeInput)
  })
}

syncSizeForm()
