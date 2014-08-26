#About

FollowInsights was highly inspired on the [Open Source Report Card](https://osrc.dfm.io/) by [Dan Foreman-Mackey](https://github.com/dfm).
Consists in getting information about people a given user follows and people followed by them.  
The idea is to find some users that maybe have some interesting code to share and are not followed by the user. It's not about to find who is BETTER or MORE POPULAR, it's just about finding some CURIOSITIES about the NETWORK where the user is inserted.

##Data Source

The application uses the dump from the [GHTorrent project](http://ghtorrent.org/) and will be outdated in most of the cases. Accessing the API through network requests will fetch the correct information but it'll be many requests in a short period and it'll exceed the API limit.

###Nomenclature

**Users on First level** - all users followed by the user  

**Users on Second level** - all users followed by the users on first level  

###Example
Let's consider a random unknown user like *[@defunkt](http://github.com/defunkt)*.  

![defunkt info](http://i.imgur.com/P9AOhiB.jpg "defunkt initial info")

Chris follows users who follows other users. Considering this relation we can find the users that are most followed by the ones that Chris follows.  

![defunkt users on second level most followed by users on first level](http://i.imgur.com/bdcz8PZ.jpg "users on second level that are most followed by users on first level")

Surprisingly, Chris is also the most followed user considering that ones who he follows (not so surprisingly, actually :))

Also, we can see information like which users are most followed in each level, who has the oldest account, or who has more public gists/repos.  

You can check @defunkt's first and second level most followed users

![defunkt most followed info](http://i.imgur.com/urM069O.jpg "most followed info")