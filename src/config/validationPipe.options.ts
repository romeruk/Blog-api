import {
  ValidationError,
  BadRequestException,
  ValidationPipeOptions,
} from '@nestjs/common';

export const validationPipeOptions: ValidationPipeOptions = {
  validationError: {
    value: false,
    target: false,
  },
  exceptionFactory: (errors: ValidationError[]) => {
    const trasformedErrros = errors.map(error => {
      return {
        name: error.property,
        message: Object.values(error.constraints).join('\n'),
      };
    });

    return new BadRequestException(trasformedErrros);
  },
};
