#About

FollowInsights was highly inspired on the [Open Source Report Card](https://osrc.dfm.io/) by [Dan Foreman-Mackey](https://github.com/dfm).
Consists in getting the information about the people who are followed by an user and the people followed by they.
The idea is to find some users that maybe have some interesting code to share and are not followed by the user. It's not about to find who is BETTER or MORE POPULAR, it's just about find some CURIOSITIES about the NETWORK where the user is inserted.

##Data Source

The application uses the dump from the [GHTorrent project](http://ghtorrent.org/) and will be outdated in most of the cases. Accessing the API through network requests will fetch the correct information but it'll be many requests in a short period and it'll exceed the API limit.