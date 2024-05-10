import { writable } from 'svelte/store';

export const globalKwargs = writable({
    fix: '',
    mov: '',
    fix_spacing: [1.0, 1.0, 1.0],
    mov_spacing: [1.0, 1.0, 1.0],
    fix_mask: null,
    mov_mask: null,
    fix_origin: null,
    mov_origin: null,
});

export const steps = writable([
    // { 
    //     id: 0, 
    //     function: 'affine',
    //     name: 'Affine', 
    //     kwargs: { 
    //         'metric' : 'MMI',
    //         // 'initial_condition' :'CENTER',
    //         'optimizer':'OPOE',
    //         // 'alignment_spacing': 1,
    //         // 'shrink_factors': (8, 4, 2, 1),
    //         // 'smooth_sigmas': (4., 4., 2., 1.),
    //         'optimizer_args':{
    //             'numberOfIterations':600,
    //             'epsilon':1.0e-6,
    //             'initialRadius':1.5,
    //         },
    //    } 
    // }
]);

const defaultKwargs = {
    metric: 'MMI',
    optimizer: 'RSGD',
    sampling: 'NONE',
    interpolator: '1',
    shrink_factors: [1,],
    smooth_sigmas: [0,],
    metric_args: {'numberOfHistogramBins': 50 },
    optimizer_args: {
        'learningRate': 0.1,
        'minStep': 1e-5,
        'numberOfIterations': 100,
        'relaxationFactor': 0.5,
        'gradientMagnitudeTolerance': 1e-4,
        'maximumStepSizeInPhysicalUnits': 0.0
    },
    sampling_percentage: null,
    exhaustive_step_sizes: null,
    callback: null
}

export const alignmentCatalog = writable([
    { 
        function: 'ransac', 
        name: 'Feature Point Ransac Affine Align', 
        kwargs: {
            blob_sizes: [0.0, 1.0],
            alignment_spacing: null,
            num_sigma_max: 15,
            cc_radius: 12,
            nspots: 5000,
            match_threshold: 0.7,
            max_spot_match_distance: null,
            point_matches_threshold: 50,
            align_threshold: 2.0,
            diagonal_constraint: 0.25,
            fix_spot_detection_kwargs: {}, // Explore more
            mov_spot_detection_kwargs: {}, // Explore more
            fix_spots: null,
            fix_spots_count_threshold: 100,
            mov_spots: null,
            mov_spots_count_threshold: 100,
            default: null,
            ...defaultKwargs
        }
    },
    {   // This transformation is broken in package due to fix_spacing type error
        function: 'random', 
        name: 'Random Affine Align', 
        kwargs: {
            random_iterations: 100,
            nreturn: 1,
            max_translation: null,
            max_rotation: null,
            max_scale: null,
            max_shear: null,
            alignment_spacing: null,
            use_patch_mutual_information: false,
            print_running_improvements: false,
            ...defaultKwargs
        }
    },
    { 
        function: 'rigid', 
        name: ' Rigid Affine Align',
        kwargs: {
            // rigid: true, // passed by default when selecting this transformation
            initial_condition: null,
            alignment_spacing: null,
            default: null,
            ...defaultKwargs
        }
    },
    { 
        function: 'affine', 
        name: 'Affine Align', 
        kwargs: {
            rigid: false,
            initial_condition: null,
            alignment_spacing: null,
            default: null,
            ...defaultKwargs
        }
    },
    {   // This transformation causes seemingly infinite loop or timeout
        function: 'deform', 
        name: 'Deformable Align', 
        kwargs: {
            control_point_spacing: 10.0,
            control_point_levels: [4, 4, 4],
            alignment_spacing: null,
            default: null,
            ...defaultKwargs
        }
    },
]);

// Metrics catalog
export const metricsCatalog = writable([
    { 
        id: 'ANC', 
        name: 'Ants Neighborhood Correlation', 
        args: {
            'radius': 5 
        }
    },
    { 
        id: 'C', 
        name: 'Correlation', 
        args: {} 
    },  
    { 
        id: 'D', 
        name: 'Demons', 
        args: { 
            'intensityDifferenceThreshold': 0.001 
        } 
    },
    { 
        id: 'JHMI', 
        name: 'Joint Histogram Mutual Information', 
        args: { 
            'numberOfHistogramBins': 20, 
            'varianceForJointPDFSmoothing': 1.5 
        } 
    },
    { 
        id: 'MMI', 
        name: 'Mattes Mutual Information', 
        args: { 
            'numberOfHistogramBins': 50 
        } 
    },
    { 
        id: 'MS', 
        name: 'Mean Squares', 
        args: {} 
    }
]);

// Optimizers catalog
export const optimizersCatalog = writable([
    { 
        id: 'A', 
        name: 'Amoeba', 
        args: {
            'simplexDelta': 0.1,
            'numberOfIterations': 200,
            'parametersConvergenceTolerance': 1e-8,
            'functionConvergenceTolerance': 1e-4,
            'withRestarts': false
        } 
    },
    { 
        id: 'CGLS', 
        name: 'Conjugate Gradient Line Search', 
        args: {
            'learningRate': 0.1,
            'numberOfIterations': 100,
            'convergenceMinimumValue': 1e-6,
            'convergenceWindowSize': 10,
            'lineSearchLowerLimit': 0.0,
            'lineSearchUpperLimit': 5.0,
            'lineSearchEpsilon': 0.01,
            'lineSearchMaximumIterations': 20,
            // 'estimateLearningRate': Once,
            'maximumStepSizeInPhysicalUnits': 0.0
        } 
    },
    { 
        id: 'E', 
        name: 'Exhaustive', 
        args: {
            'numberOfSteps': 10,
            'stepLength': 1.0,
            'exhaustive_step_sizes': [1.0,]
        } 
    },
    { 
        id: 'GD', 
        name: 'Gradient Descent', 
        args: {
            'learningRate': 0.1,
            'numberOfIterations': 100,
            'convergenceMinimumValue': 1e-6,
            'convergenceWindowSize': 10,
            // 'estimateLearningRate': Once,
            'maximumStepSizeInPhysicalUnits': 0.0
        } 
    },
    { 
        id: 'GDLS', 
        name: 'Gradient Descent Line Search', 
        args: {
            'learningRate': 0.1,
            'numberOfIterations': 100,
            'convergenceMinimumValue': 1e-6,
            'convergenceWindowSize': 10,
            'lineSearchLowerLimit': 0.0,
            'lineSearchUpperLimit': 5.0,
            'lineSearchEpsilon': 0.01,
            'lineSearchMaximumIterations': 20,
            // 'estimateLearningRate': Once,
            'maximumStepSizeInPhysicalUnits': 0.0
        } 
    },
    { 
        id: 'LBFGS2', 
        name: 'Limited Memory Broyden Fletcher Goldfarb Shannon w/o bounds', 
        args: {
            'solutionAccuracy': 1e-5,
            'numberOfIterations': 0,
            'hessianApproximateAccuracy': 6,
            'deltaConvergenceDistance': 0,
            'deltaConvergenceTolerance': 1e-5,
            'lineSearchMaximumEvaluations': 40,
            'lineSearchMinimumStep': 1e-20,
            'lineSearchMaximumStep': 1e20,
            'lineSearchAccuracy': 1e-4
        } 
    },
    { 
        id: 'LBFGSB', 
        name: 'Limited Memory Broyden Fletcher Goldfarb Shannon w/ simple bounds', 
        args: {
            'gradientConvergenceTolerance': 1e-5,
            'numberOfIterations': 500,
            'maximumNumberOfCorrections': 5,
            'maximumNumberOfFunctionEvaluations': 2000,
            'costFunctionConvergenceFactor': 1e7,
            'lowerBound': Number.MIN_VALUE,
            'upperBound': Number.MAX_VALUE,
            'trace': false 
        } 
    },
    { 
        id: 'OPOE', 
        name: 'One Plue One Evolutionary', 
        args: {
            'numberOfIterations': 100,
            'epsilon': 1.5e-4,
            'initialRadius': 1.01,
            'growthFactor': -1.0,
            'shrinkFactor': -1.0,
            // 'seed': sitkWallClock 
        } 
    },
    { 
        id: 'P', 
        name: 'Powell', 
        args: {
            'numberOfIterations': 100,
            'maximumLineIterations': 100,
            'stepLength': 1,
            'stepTolerance': 1e-6,
            'valueTolerance': 1e-6 
        } 
    },
    { 
        id: 'RSGD', 
        name: 'Regular Step Gradient Descent', 
        args: {
            'learningRate': 0.1,
 	        'minStep': 1e-5,
            'numberOfIterations': 100,
            'relaxationFactor': 0.5,
            'gradientMagnitudeTolerance': 1e-4,
            // 'estimateLearningRate': Never,
            'maximumStepSizeInPhysicalUnits': 0.0
        } 
    }
]);

// Sampling strategies catalog
export const samplingStrategiesCatalog = writable([
    { 
        id: 'NONE', 
        name: 'None' 
    },
    { 
        id: 'REGULAR', 
        name: 'Regular', 
        args: { 
            'percentage': 0.1 
        } 
    },
    { 
        id: 'RANDOM', 
        name: 'Random', 
        args: { 
            'percentage': 0.1 
        } 
    }
]);

// Interpolators catalog
export const interpolatorsCatalog = writable([
    { 
        id: '1', 
        name: 'Linear' 
    },
    { 
        id: '0', 
        name: 'Nearest Neighbor' 
    },
    { 
        id: 'CBS', 
        name: 'Cubic B-Spline' 
    },
    { 
        id: 'G', 
        name: 'Gaussian' 
    },
    { 
        id: 'LG', 
        name: 'Label Gaussian' 
    },
    { 
        id: 'HWS', 
        name: 'Hamming Windowed Sinc' 
    },
    { 
        id: 'CWS', 
        name: 'Cosine Windowed Sinc' 
    },
    { 
        id: 'WWS', 
        name: 'Welch Windowed Sinc' 
    },
    { 
        id: 'LWS', 
        name: 'Lanczos Windowed Sinc' 
    },
    { 
        id: 'BWS', 
        name: 'Blackman Windowed Sinc' 
    }
]);

// Shrink Factors catalog
export const shrinkFactorsCatalog = writable([
    {
        'shrink_factors': [1,],
    }
]);

// Smooth Sigmas catalog
export const smoothSigmasCatalog = writable([
    {
        'smooth_sigmas': [0,],
    }
]);