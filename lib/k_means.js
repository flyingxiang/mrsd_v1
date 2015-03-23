function k_means(features,k,threshold)
{
    var clusters = new Array();
    var centers = new Array();
    var new_centers = new Array();
    var length = features.length;
    var t = threshold;
    var test = 0;
    for(var i=0;i<k;++i){
	new_centers[i] = features[Math.floor(Math.random()*length)];  //以随机点作为初始聚类中心
    }
    do{
	++test;
	var flag = true;
	for(i=0;i<k;++i){  //以新聚类中心继续运算
	    centers[i] = new_centers[i].clone();
	    clusters[i] = new Array();
	}
	for(var j=0;j<length;++j){  //点聚类
	    var distance = new Array();
	    var min_distance = 99999999;
	    var min_index = 0;
	    for(i=0;i<k;++i){
		distance[i] = Math.sqrt(Math.pow(features[j].geometry.x-centers[i].geometry.x,2)+Math.pow(features[j].geometry.y-centers[i].geometry.y,2));
		if(distance[i]<min_distance){
		    min_distance = distance[i];
		    min_index = i;
		}
	    }
	    clusters[min_index].push(features[j]);
	}
	for(i=0;i<k;++i){  //求聚类中心
	    var x_sum = 0;
	    var y_sum = 0;
	    for(j=0;j<clusters[i].length;++j){
		x_sum += clusters[i][j].geometry.x;
		y_sum += clusters[i][j].geometry.y;
	    }
	    new_centers[i].geometry.x = x_sum/clusters[i].length;
	    new_centers[i].geometry.y = y_sum/clusters[i].length;
	    if(Math.abs(new_centers[i].geometry.x-centers[i].geometry.x>t)||Math.abs(new_centers[i].geometry.y-centers[i].geometry.y>t))  //只要有一个聚类中心偏移超过阈值，就继续迭代
		flag = false;
	}
    }while(!flag)
    console.log("Number of k-means loops: " + test);
    return new_centers;
}
