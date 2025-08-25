# technical
The sim itself will run in its own process (daemon). The site knows what games are running because the sim posts running games in the database, and the client can watch games by subscribing to server-side events endpoints hosted by the sim's orchestrator.

The sim process has two parts: the simulation and the orchestrator.
The orchestrator handles timing (running games every N hours and ticking running games every ~3s) as well as serving SSEs.
The whole process will have to basically be entirely async - SSE connections await new game events, each game's function in the orchestrator waits for the next tick, etc.
The orchestrator calls the setup and tick functions on games for the simulation.

The simulation is in charge of actually setting up, running, and saving games. The orchestrator will pick teams to play in the current type of game (standard, exhibition, etc), and will hand team IDs to the simulation to setup a game. The simulation handles pulling player and team data from the DB to populate the game and will post periodic updates to the database for listing purposes, as well as saving results to the database when the game ends.

Would be nice to have the sim and orchestrator in different processes for latency reasons but I don't think node likes multiprocessing and it should take a while before the async method bottlenecks. NFS's beefy cores should mean that running single-thread processes and multithreaded processes will be roughly the same cost/efficiency.

Orchestrator should also have a couple of utility feeds available, for starting and finishing games etc.

# actual game
okay new system: actors
basically its like football video games where you pick someone to play as based on whos actually doing anything rn. the game picks a player to be "active" based on who has posession or is actively making plays. everyone else sort of passively runs around based on their position and the state of the game. I think I want some sort of circle-fitting function to pick a good spot to run to? we'll see how necessary that is though

step 1: passive play: COMPLETIONED
everyone runs to their position marker based on where the ball is

step 2: basic acting
someone become the active player, kicks the ball around. if someone else hits the ball they get to be actve

step 3: looking
find a decent web graphics ui (groan) (maybe this is the time to just fucking learn webGL) and implement the worlds basicest ass SSE
I think on the earlier thoughts about running SSEs if the server's just rockin bare ass common lib node webserver thatll save on express overhead and also it means more transparent control of the actual connection which is probably more helpful for SSEs
or actually there's probably a library for em lmao. promiseful and shit
perhaps it would be more interesting to do it myshelf

step 4: better acting
actors will pass, shoot for the goal, etc etc. try and figure out how to select players and shit

step 5: opportunistic passive players
passive players can try and move towards gaps or get in the way of the ball, goalkeeper will advance a bit out of the goal box if there's space

step 6: game logic
kickoffs and scoring and timers oh my

step 7: and so it goes
just kinda keep elaborating on the players AI until it approaches something that looks like real football

step 8: make it good
fix up the web UI, start implementing it into the main server so you can look at games

step 9: dating the bases
pull teams and players from the DB, load ongoing game data into it

step 10: schedule of wedule
games happen on their own! wowie

step 11: i mean thats the game surely
