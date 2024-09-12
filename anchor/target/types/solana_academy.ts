/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_academy.json`.
 */
export type SolanaAcademy = {
  "address": "6YHkJkEAdhKercoULeR4tShiJzSWCNFMEG7QhMNX4CsD",
  "metadata": {
    "name": "solanaAcademy",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createCourse",
      "discriminator": [
        120,
        121,
        154,
        164,
        107,
        180,
        167,
        241
      ],
      "accounts": [
        {
          "name": "academy",
          "writable": true
        },
        {
          "name": "course",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "academy"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "courseData",
          "type": {
            "defined": {
              "name": "courseData"
            }
          }
        }
      ]
    },
    {
      "name": "enrollInCourse",
      "discriminator": [
        148,
        151,
        118,
        109,
        223,
        161,
        90,
        172
      ],
      "accounts": [
        {
          "name": "academy",
          "writable": true
        },
        {
          "name": "course",
          "writable": true
        },
        {
          "name": "enrollment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  114,
                  111,
                  108,
                  108,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "course"
              },
              {
                "kind": "account",
                "path": "student"
              }
            ]
          }
        },
        {
          "name": "student",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "studentNftMint"
        },
        {
          "name": "studentTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "courseId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "enrollStudentInAcademy",
      "discriminator": [
        255,
        180,
        113,
        188,
        101,
        15,
        188,
        87
      ],
      "accounts": [
        {
          "name": "academy",
          "writable": true
        },
        {
          "name": "studentNftMint",
          "writable": true
        },
        {
          "name": "studentTokenAccount",
          "writable": true
        },
        {
          "name": "student",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "payment",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeAcademy",
      "discriminator": [
        255,
        97,
        73,
        10,
        91,
        205,
        27,
        133
      ],
      "accounts": [
        {
          "name": "academy",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "academy",
      "discriminator": [
        110,
        0,
        104,
        223,
        115,
        197,
        131,
        156
      ]
    },
    {
      "name": "course",
      "discriminator": [
        206,
        6,
        78,
        228,
        163,
        138,
        241,
        106
      ]
    },
    {
      "name": "enrollment",
      "discriminator": [
        249,
        210,
        64,
        145,
        197,
        241,
        57,
        51
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidCourseId",
      "msg": "The provided course ID is invalid"
    },
    {
      "code": 6001,
      "name": "courseIsFull",
      "msg": "The course is already full"
    },
    {
      "code": 6002,
      "name": "alreadyEnrolled",
      "msg": "The student is already enrolled in this course"
    },
    {
      "code": 6003,
      "name": "insufficientSchoolFee",
      "msg": "Insufficient balance to pay school fees"
    },
    {
      "code": 6004,
      "name": "insufficientCourseFee",
      "msg": "Insufficient balance to pay school fees"
    },
    {
      "code": 6005,
      "name": "insufficientBalance",
      "msg": "Insufficient balance to pay tuition fee"
    },
    {
      "code": 6006,
      "name": "invalidNftAuthority",
      "msg": "Invalid mint NFT mint authority"
    },
    {
      "code": 6007,
      "name": "invalidStudentNft",
      "msg": "Invalid student NFT"
    }
  ],
  "types": [
    {
      "name": "academy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "courseCount",
            "type": "u64"
          },
          {
            "name": "enrollmentFee",
            "type": "u64"
          },
          {
            "name": "studentCounter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "course",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "tuitionFee",
            "type": "u64"
          },
          {
            "name": "enrollmentCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "courseData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "tuitionFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "enrollment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "student",
            "type": "pubkey"
          },
          {
            "name": "course",
            "type": "pubkey"
          },
          {
            "name": "enrolledAt",
            "type": "i64"
          },
          {
            "name": "completed",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
