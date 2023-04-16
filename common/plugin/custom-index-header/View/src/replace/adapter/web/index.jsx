import Search from './search-input';
import Carousel from './carousel';

export default function (props) {
  console.log(props);
  const { dzqRouter, siteData } = props;

  const onInputClick = () => {
    dzqRouter.router?.push('/search');
  };

  return (
    <div>
      <Search site={siteData} onInputClick={onInputClick}></Search>
      <Carousel></Carousel>
    </div>
  );
}
