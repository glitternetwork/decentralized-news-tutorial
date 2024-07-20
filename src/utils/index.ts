export const filterSameArr = (data: any[]) => {
    const uniqueItems = data.reduce((acc, item) => {
      const isDuplicate = acc.some((i: any) => i.title === item.title);
      if (!isDuplicate) {
        acc.push(item);
      }
      return acc;
    }, []);
    return uniqueItems;
  };