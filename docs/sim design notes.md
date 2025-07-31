# technical
I think keeping the main web server and the sim server is still valuable for like. being able to do maintenance on the sim stuff without turning off the main site?
But I do think I want the sim server to be able to serve updates itself via SSE
Sim server will commune with the database to determine what teams to run etc and save details of games now being run, which the site can look at and go "oh theres games"
fantastical.football/game/9x9fjj-28f73k will just be a page served by the main web server, the client can then ask fantastical.football/feeds/9x9fjj-28f73k (on the sim server) for game feeds.
Sim server web bit and game bit will still mostly have to be their own sections I think? Where exactly the seperation sits will have to depend on how limited processing time is between serving SSEs and running the games so ehehhhhhhhhhhh but thats the main idea

# actual game
step 1: guys that run around
everyone just runs at the ball. if theyre near enough the ball they try and kick it towards the goal or towards a random teammate if they're too far from the goal
i think we can do this bit before we need any graphics

step 2: looking
find a decent web graphics ui (groan) (maybe this is the time to just fucking learn webGL) and implement the worlds basicest ass SSE
I think on the earlier thoughts about running SSEs if the server's just rockin bare ass common lib node webserver thatll save on express overhead and also it means more transparent control of the actual connection which is probably more helpful for SSEs
or actually there's probably a library for em lmao. promiseful and shit
perhaps it would be more interesting to do it myshelf

step 3: guys that run around, smarter
assign people positions. people will try and stand in their positions relative to the ball's location (and start bunching up next to the goal?) but move in to kick when the balls near them

step 4: game logic
kickoffs and actual goal scoring and maybe the timer

step 5: and so it goes
just kinda keep elaborating on the players AI until it approaches something that looks like real football

step 6: make it good
fix up the web UI, start implementing it into the main server so you can look at games

step 7: dating the bases
pull teams and players from the DB, load ongoing game data into it

step 8: schedule of wedule
games happen on their own! wowie

step 9: i mean thats the game surely
