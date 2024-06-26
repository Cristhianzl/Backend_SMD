import { ClassConstructor, plainToClass } from 'class-transformer';

export class BaseDto {
  public static factory<T, R>(EntityDto: ClassConstructor<T>, data: R) {
    if ((data as any)?.rows) {
      data = (data as any)?.rows;
    }

    const updatedResponseData = plainToClass<T, R>(EntityDto, data, {
      ignoreDecorators: true,
    });

    return {
      data: updatedResponseData,
    };
  }

  public static factoryPaginate<T, R>(
    EntityDto: ClassConstructor<T>,
    data: R,
    pageIndex?,
    pageSize?,
    totalItems?,
    hasActive?,
    moreOptions?,
  ) {
    if ((data as any)?.rows) {
      data = (data as any)?.rows;
    }

    const updatedResponseData = plainToClass<T, R>(EntityDto, data, {
      ignoreDecorators: true,
    });

    const returnData = {
      data: updatedResponseData,
      pageIndex: pageIndex,
      pageSize: pageSize,
      count: totalItems,
      hasActive: hasActive,
      moreOptions: moreOptions,
    };

    return returnData;
  }
}
