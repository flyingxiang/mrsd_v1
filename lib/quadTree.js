var gridSize = 20037508;
var width = gridSize*2;


/**
 * 递归生成单个要素在四叉树中0到maxLevel-1的Morton码
 * @param thisFeature
 * @param codeNum
 * @param currentLevel
 * @param maxLevel
 * @param x0
 * @param y0
 * @returns {*}
 */
function makeMortonCode(thisFeature,codeNum,currentLevel,maxLevel,x0,y0)
{
	++currentLevel;
	var maxExtent = 20037508;
    var extent = maxExtent/(Math.pow(2,currentLevel));

    // create new memory and copy by value in this recursive manner is painfully slow
    // change it to copy-by-reference
    var featureWithCode = thisFeature/* .clone() */;
	
    if(currentLevel <= maxLevel)
    {
		if(featureWithCode.geometry.x<=x0 && featureWithCode.geometry.y<=y0){
			featureWithCode.attributes.code[codeNum][currentLevel-1] = 0;
			return makeMortonCode(featureWithCode,codeNum,currentLevel,maxLevel,x0-extent,y0-extent);
		}
		if(featureWithCode.geometry.x>x0 && featureWithCode.geometry.y<=y0){
			featureWithCode.attributes.code[codeNum][currentLevel-1] = 1;
			return makeMortonCode(featureWithCode,codeNum,currentLevel,maxLevel,x0+extent,y0-extent);
		}
		if(featureWithCode.geometry.x<=x0 && featureWithCode.geometry.y>y0){
			featureWithCode.attributes.code[codeNum][currentLevel-1] = 2;
			return makeMortonCode(featureWithCode,codeNum,currentLevel,maxLevel,x0-extent,y0+extent);
		}
		if(featureWithCode.geometry.x>x0 && featureWithCode.geometry.y>y0){
			featureWithCode.attributes.code[codeNum][currentLevel-1] = 3;
			return makeMortonCode(featureWithCode,codeNum,currentLevel,maxLevel,x0+extent,y0+extent);
		}
    }else{
		return featureWithCode;
	}
}

//要素平移
function featureShift(features,xShift,yShift)
{
    for(var i=0;i!=features.length;++i){
		features[i].geometry.x = features[i].geometry.x+xShift;
		if(features[i].geometry.x>gridSize)
			features[i].geometry.x -= width;
		if(features[i].geometry.x<-gridSize)
			features[i].geometry.x += width;
		features[i].geometry.y = features[i].geometry.y+yShift;
		if(features[i].geometry.y>gridSize)
			features[i].geometry.y -= width;
		if(features[i].geometry.y<-gridSize)
			features[i].geometry.y += width;
    }
    return features;
}

//要素随机评分，实验数据
function impScore(features)
{
    for(var i=0;i!=features.length;++i){
		features[i].attributes.score = Math.floor(Math.random()*100);
    }
    return features;
}

/**
 * calculate random numbers in [-positiveRange, positiveRange]
 * @param positiveRange {number} positive number is expected
 * @returns {number}
 */
function randomValue(positiveRange)
{
    return Math.random() * (Math.random() < 0.5 ? -1 : 1) * positiveRange;
}

//计算DS，未优化
function dScore(features,curLevel,curExtent,index)
{
	var VIPs = new Array(Math.pow(4,curLevel+1));
	for(var i=0;i!=VIPs.length;++i){
		VIPs[i] = features[0];
	}
    for(var i=0;i!=features.length;++i){
		var code = 0;
		for(var j=0;j!=curLevel+1;++j){
			code += features[i].attributes.code[index][j]*(Math.pow(4,j));
		}
		if(features[i].attributes.score > VIPs[code].attributes.score)
			VIPs[code] = features[i];
    }
	for(var i=0;i!=VIPs.length;++i)
		VIPs[i].attributes.ds[curLevel] +=1;
}

//计算DS，优化
function dScoreFine(features,curLevel,curExtent,index)
{
    var op1 = new Array(0,width/3,2*width/3,2*width/3,width/3,0,0,width/3,2*width/3);
    var op2 = new Array(0,0,0,width/3,width/3,width/3,2*width/3,2*width/3,2*width/3);
	var left = curExtent.left + op1[index];
	var right = curExtent.right + op1[index];
	var top = curExtent.top + op2[index];
	var bottom = curExtent.bottom + op2[index];
	
	var delta = gridSize/(Math.pow(2,curLevel+4));

	var x1 = Math.floor((left+gridSize)/delta)-1;
	var y1 = Math.floor((bottom+gridSize)/delta)-1;
	var x2 = Math.floor((right+gridSize)/delta)+1;
	var y2 = Math.floor((top+gridSize)/delta)+1;

    var VIPs = new Array(x2-x1+1);
	for(var i=0;i!=VIPs.length;++i)
	{
		VIPs[i] = new Array(y2-y1+1);
		
		for(var j=0;j!=VIPs[i].length;++j)
		{
			VIPs[i][j] = new OpenLayers.Feature.Vector();
			VIPs[i][j].attributes.score = 0;
		}
	}
	
    for(var i=0;i<features.length;++i)
	{
		var x = 0;
		var y = 0;
		var xt,yt;
		
		// Morton 码转换为行列号
		for(var j=0;j<=curLevel+4;++j)
		{			
			switch(features[i].attributes.code[index][j]){
			case 0 :
				x += Math.pow(2,curLevel+4-j)*0;
				y += Math.pow(2,curLevel+4-j)*0;
				break;
			case 1 :
				x += Math.pow(2,curLevel+4-j)*1;
				y += Math.pow(2,curLevel+4-j)*0;
				break;
			case 2 :
				x += Math.pow(2,curLevel+4-j)*0;
				y += Math.pow(2,curLevel+4-j)*1;
				break;
			case 3 :
				x += Math.pow(2,curLevel+4-j)*1;
				y += Math.pow(2,curLevel+4-j)*1;
				break;
			}
		}
		if(x<x1)
			xt = x-x1+Math.pow(2,curLevel+5);
		else
			xt = x-x1;
		if(y<y1)
			yt = y-y1+Math.pow(2,curLevel+5);
		else
			yt = y-y1;
		if(features[i].attributes.score > VIPs[xt][yt].attributes.score)
			VIPs[xt][yt] = features[i];
    }
	
	for(var i=0;i!=VIPs.length;++i){
		for(var j=0;j!=VIPs[i].length;++j){
			if(VIPs[i][j].attributes.score!=0)
				VIPs[i][j].attributes.ds[curLevel] +=1;
		}
	}
}

/**
 *
 * @param features
 * @param quadLevel - {Integer}  level in the quadtree for which the score is to be calculated
 * @param curExtent
 * @param index
 */
function calculateScoreInWindow(features, quadLevel, curExtent, index)
{
    var op1 = new Array(0, width/3, 2*width/3, 2*width/3, width/3, 0, 0, width/3, 2*width/3);
    var op2 = new Array(0, 0, 0, width/3, width/3, width/3, 2*width/3, 2*width/3, 2*width/3);

    var left = curExtent.left + op1[index];
    var right = curExtent.right + op1[index];
    var top = curExtent.top + op2[index];
    var bottom = curExtent.bottom + op2[index];

    var colNum = Math.pow(2, quadLevel);
    var delta = width / colNum;

    var x1 = Math.floor((left+gridSize)/delta)-1;
    var y1 = Math.floor((bottom+gridSize)/delta)-1;
    var x2 = Math.floor((right+gridSize)/delta)+1;
    var y2 = Math.floor((top+gridSize)/delta)+1;

    var VIPs = new Array(x2-x1+1);
    for(var i=0;i!=VIPs.length;++i)
    {
        VIPs[i] = new Array(y2-y1+1);

        for(var j=0;j!=VIPs[i].length;++j)
        {
            VIPs[i][j] = new OpenLayers.Feature.Vector();
            VIPs[i][j].attributes.score = 0;
        }
    }

    for(var i=0;i<features.length;++i)
    {
        var x = 0;
        var y = 0;
        var _col, _row;

        // Morton 码转换为行列号
        for (var j=0; j < quadLevel; ++j)
        {
            switch(features[i].attributes.code[index][j]){
                case 0 :
                    break;
                case 1 :
                    x += Math.pow(2, (quadLevel-1)-j);
                    break;
                case 2 :
                    y += Math.pow(2, (quadLevel-1)-j);
                    break;
                case 3 :
                    x += Math.pow(2, (quadLevel-1)-j);
                    y += Math.pow(2, (quadLevel-1)-j);
                    break;
            }
        }
        if (x < x1)
            _col = x + colNum - x1;
        else
            _col = x - x1;
        if (y < y1)
            _row = y + colNum - y1;
        else
            _row = y - y1;

        //
        if(features[i].attributes.score > VIPs[_col][_row].attributes.score)
            VIPs[_col][_row] = features[i];
    }

    for(var i=0;i!=VIPs.length;++i){
        for(var j=0;j!=VIPs[i].length;++j){
            if(VIPs[i][j].attributes.score!=0)
                VIPs[i][j].attributes.ds[quadLevel] +=1;
        }
    }
}

//判断点是否在窗口范围内
function isInViewport(feature,curExtent)
{
	var left = curExtent.left;
	var right = curExtent.right;
	var top = curExtent.top;
	var bottom = curExtent.bottom;
	var x = feature.geometry.x;
	var y = feature.geometry.y;
	if(x>left && x<right && y>bottom && y<top)
		return true;
	else
		return false;
}

//为所有要素生成多次平移的多个Morton码
function codeAll(features,maxLevel,curLevel)
{
    var my = new Array();
    var length = features.length;
    for(var i=0;i!=length;++i){
		my[i] = features[i]/*.clone()*/;
		my[i].attributes.code = new Array();
		my[i].attributes.ds = new Array(maxLevel);
    }
    console.log("CodeAll: features copied.\n");
    
    my = impScore(my);
    console.log("CodeAll: imp scores calculated.\n");
    
    var op1 = new Array(0,width/3,width/3,0,-width/3,-width/3,0,width/3,width/3);
    var op2 = new Array(0,0,0,width/3,0,0,width/3,0,0);
    for(i=0;i!=9;++i){
		my = featureShift(my,op1[i],op2[i]);
		for(var j=0;j!=length;++j){
			my[j].attributes.code[i] = new Array();
			my[j] = makeMortonCode(my[j],i,0,maxLevel,0,0);
		}
		console.log("CodeAll: Morton coding for #" + i + "shift.\n");
    }
    my = featureShift(my,-2*width/3,-2*width/3);
	return my;
}

//不平移
function codeAll2(features,maxLevel,curLevel)
{
    var my = new Array();
    var length = features.length;
    for(var i=0;i!=length;++i){
		my[i] = features[i].clone();
		my[i].attributes.code = new Array();
		my[i].attributes.ds = new Array(maxLevel);
    }
    my = impScore(my);
	for(var j=0;j!=length;++j){
		my[j].attributes.code[0] = new Array();
		my[j] = makeMortonCode(my[j],0,0,maxLevel,0,0);
	}
	return my;
}

function quadTreeCluster(features,curLevel,DS)
{
	var clusteredFeatures = new Array();
	for(var i=0;i!=features.length;++i){
		if(features[i].attributes.ds[curLevel] >= DS)
			clusteredFeatures.push(features[i]);
	}
	return clusteredFeatures;
}
