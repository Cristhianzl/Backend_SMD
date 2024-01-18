import { ApiHideProperty } from '@nestjs/swagger';
import { ClassConstructor, plainToClass } from 'class-transformer';

export class BaseDto {
  public static factory<T, R>(
    EntityDto: ClassConstructor<T>,
    data: R,
    code?,
    message?,
  ) {
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
  ) {
    const updatedResponseData = plainToClass<T, R>(EntityDto, data, {
      ignoreDecorators: true,
    });

    const returnData = {
      data: updatedResponseData,
      pageIndex: pageIndex,
      pageSize: pageSize,
      count: totalItems,
      hasActive: hasActive,
    };

    return returnData;
  }
}
