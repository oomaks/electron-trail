const A = function(){
	console.log('asssssssssssssss');
};

A.getInstance = function(){
	if(!A.instance) {
		A.instance = new A();
	}
	return A.instance;
};

A.arr = [];

module.exports = A;