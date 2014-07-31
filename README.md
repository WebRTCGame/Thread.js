Thread.js
========

is a javascript plugin, which allows you to execute any function of a your code in a thread.

**Standalone function**: simply pass it as an argument to the Thread(), and get the result in a callback function. You don't need to create a separate file for each thread, like you normally do with a regular worker.

**Object's method**: Thread accepts context as an optional parameter and executes function in its context. Simply pass the object as a context, that's it.

**Function with dependencies**: Thread accepts a list of file names as an optional argument and imports these files in the thread before the function is calling

In main page you execute it this way:

>```javascript
> function sum(num1, num2) {
>     return num1 + num2;
>}
>
>var foo = sum(2,3);
>console.log(foo);

Now, let's open a new thread and execute function sum() in this thread.
>```javascript
> function sum(num1, num2) {
>     return num1 + num2;
>}
>
>Thread.exec(
>	sum,                // function to execute in a thread
>   [2,3],              // arguments for the function
>	function(data){     // callback function to process result
>		var foo = data;
>		console.log(foo);
>	}
>);

See live examples at [http://eslinstructor.net/vkthread](http://eslinstructor.net/vkthread)

Thread.js is built on HTML5 "Worker" technology. It also incorporates [JSONfn](http://www.eslinstructor.net/jsonfn/) code to implement the key tasks.
In spite of technical complexity, plugin is super compact. Development version (plain text with comments) is less than 2k. I don't care to minifiy it.