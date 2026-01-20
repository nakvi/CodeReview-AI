<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // No authentication required
    }

    public function rules(): array
    {
        return [
            'user_name' => [
                'required',
                'string',
                'max:100',
            ],
            'filename' => [
                'required',
                'string',
                'max:255',
                'regex:/^[\w\-. ]+$/', // Only alphanumeric, dash, underscore, dot, space
            ],
            'language' => [
                'required',
                'string',
                'in:javascript,php,python,java,csharp,ruby,go,typescript,swift,kotlin',
            ],
            'code' => [
                'required',
                'string',
                'min:10',
                'max:50000', // Max 50KB of code
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'user_name.required' => 'Please provide your name.',
            'filename.required' => 'Please provide a filename for your code.',
            'filename.regex' => 'Filename contains invalid characters.',
            'language.required' => 'Please select a programming language.',
            'language.in' => 'The selected language is not supported.',
            'code.required' => 'Please provide the code to review.',
            'code.min' => 'Code must be at least 10 characters.',
            'code.max' => 'Code is too large. Maximum 50,000 characters allowed.',
        ];
    }
}