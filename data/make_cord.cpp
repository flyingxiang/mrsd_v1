#include <fstream>
#include <cstdlib>
#include <ctime>
#include <iomanip>
using namespace std;

void main()
{
    ofstream outfile;
    outfile.open("my.kml",ofstream::out|ofstream::trunc);//
	long double random(long double,long double);
    srand(unsigned(time(0)));
    for(int i=0;i<1000;++i){
      long double lon=random(0,180000000)/1000000;
      long double lat=random(0,90000000)/1000000;
	  outfile<<setiosflags(ios::fixed);
      outfile<<setprecision(6)<<lat<<","<<lon<<endl;
    }
}

long double random(long double start, long double end)
{ return start+(end-start)*rand()/(RAND_MAX+ 1.0);}